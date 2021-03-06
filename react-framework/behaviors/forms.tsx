﻿import * as rx from 'rxjs/Rx';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as flux from '../flux';

const moduleId = 'behaviors';

//************** FIELD

enum TFieldActions { setState };
interface FieldActionPar<T> extends flux.IActionPar { value: T; }

export interface IFieldContext extends flux.IComponentContext { MyInput: { modifyInputTagProps(props: React.HTMLAttributes); }; }

export abstract class FieldLow<V, T extends FieldLowStore<V>, P> extends flux.Component<T, FieldLowProps<V> & P> { getChildContext(): IFieldContext { return { MyInput: this.state, $parent: this.state }; } }
//FieldLow['contextTypes'] = { MyForm: React.PropTypes.any, $parent: React.PropTypes.any };
FieldLow['childContextTypes'] = { MyInput: React.PropTypes.any, $parent: React.PropTypes.any };

type TFieldComponent = FieldLow<any, FieldLowStore<any>, {}>;

export interface FieldLowProps<V> {
  $title?: string;
  $defaultValue?: V;
  $validatorAsync?: (val: V, completed: flux.TSyncCompleted) => void;
  $validator?: flux.TSyncValidator<V> | Array<flux.TSyncValidator<V>>;
}

//************** FieldLowStore
export abstract class FieldLowStore<V> extends flux.Store<FieldLowProps<V>> {
  $actionInBlur: boolean;
  $actionInHandleChange: boolean;
  //state
  value: V;
  error: string;
  blured: boolean;
  validating: boolean;

  //abstract value
  assignTo(val: V): V { return val; }
  modified(val1: V, val2: V): boolean { return val1 === val2; }

  getMyForm(): FormLowStore { var fld = this.$parent; while (fld != null) { if (fld instanceof FormLowStore) return fld as FormLowStore; fld = fld.$parent; } return null; }

  componentCreated() { super.componentCreated(); FormLowStore.register(this.getMyForm(), this, true); }
  componentWillUnmount(): void { this.asyncCancel(); FormLowStore.register(this.getMyForm(), this, false); super.componentWillUnmount(); }

  initStateFromProps(props: FieldLowProps<V>) { super.initStateFromProps(props); this.value = this.assignTo(props.$defaultValue); }

  validate(completed?: (error: string) => void) {
    this.blured = true;
    this.setAndValidate(false, this.value, completed);
  }
  reset() {
    this.asyncCancel();
    delete this.$asyncLastResult;
    this.modify(st => {
      if (this.getProps()) st.value = this.assignTo(this.getProps().$defaultValue);
      delete st.error;
    });
  }
  doDispatchAction(id: number, par: FieldActionPar<V>): Promise<any> {
    switch (id) {
      case TFieldActions.setState:
        this.blured = true;
        return new Promise((ok, err) => this.setAndValidate(false, par.value, er => ok()));
      default: return super.doDispatchAction(id, par);
    }
  }

  modifyInputTagProps(props: React.HTMLAttributes) { }

  protected hasValidator(): boolean { return !!this.getProps().$validator || !!this.getProps().$validatorAsync; }

  protected blur() {
    console.log('blur');
    if (this.$actionInBlur) this.action<FieldActionPar<V>>(TFieldActions.setState, 'setState', { value: this.value }); else this.setAndValidate(false, this.value);
  }

  protected handleChange(value: V) {
    this.asyncCancel();
    if (this.$actionInHandleChange) this.action<FieldActionPar<V>>(TFieldActions.setState, 'setState', { value: value }); else this.setAndValidate(true, value);
    //this.setAndValidate(true, value);
  }

  private setAndValidate(inHandleChange: boolean, val: V, completed?: flux.TSyncCompleted) {
    let self = this;
    self.value = val;

    //******* local functions
    function refreshComponent(error: string) { //setState (=>render) & call completed
      self.modify(st => st.error = error);
      if (completed) completed(error);
    }
    function asyncStart() { //start of async validation
      console.log('asyncStart');
      self.asyncCancel();
      self.modify(st => { st.validating = true; st.error = null; });
      let obs: rx.Observable<string> = rx.Observable.create((obs: rx.Subscriber<string>) => {
        self.getProps().$validatorAsync(val, err => { console.log('getErrorAsync completed'); self.asyncDelete(); if (err) obs.error(err); else obs.complete(); });
        return () => { };
      });
      self.$asyncConnectable = obs.publish();
      self.$asyncSubscription = self.$asyncConnectable.connect();
    }
    function asyncSubscribe() { //subscribe to async validation result
      let lastVal = val;
      let done = err => { self.$asyncLastResult = { value: self.assignTo(lastVal), error: err }; refreshComponent(err); }
      self.$asyncConnectable.subscribe(null, err => done(err), () => done(null));
    }

    //******* no validation
    if (!this.hasValidator()) { refreshComponent(null); return; }

    //******* sync validation
    if (this.getProps().$validator) {
      if (!self.blured) { refreshComponent(null); return; }
      let error = null;
      var vals = Array.isArray(this.getProps().$validator) ? this.getProps().$validator as Array<flux.TSyncValidator<V>> : [this.getProps().$validator as flux.TSyncValidator<V>];
      if (vals.find(v => { error = v(val); return !!error; })) { refreshComponent(error); return; }
    }

    if (!this.getProps().$validatorAsync) { refreshComponent(null); return; }

    //******* async validation
    //** at handleChange
    //no async validation at the handleChange
    if (inHandleChange) { self.asyncCancel(); refreshComponent(null); return; }

    //** at blur or validate
    //just validating value is the same => subscribe to its result
    if (!this.modified(val, self.$asyncValidatingValue)) { asyncSubscribe(); return; }//async validation already running => subscribe to its result

    //use last validation: value does not changed => show last error
    if (self.$asyncLastResult && self.$asyncLastResult.value == val) { if (completed) completed(self.$asyncLastResult.error); return; }

    //value is not validated yet:
    self.$asyncValidatingValue = self.assignTo(val); //remember just validated value
    asyncStart(); //start validation
    asyncSubscribe(); //subscribe to validation result
  }

  //asynchronni validace
  private $asyncSubscription: rx.Subscription;
  private $asyncConnectable: rx.ConnectableObservable<any>;
  asyncCancel() {
    if (!this.$asyncSubscription) return;
    console.log('asyncCancel');
    this.$asyncSubscription.unsubscribe();
    this.asyncDelete();
  }
  private asyncDelete() { delete this.$asyncSubscription; delete this.$asyncConnectable; delete this.$asyncValidatingValue; delete this.validating; }
  private $asyncValidatingValue: V;
  private $asyncLastResult: { value: V; error: string; };

}
type TFieldLowStore = FieldLowStore<any>

//************** InputTag
export class InputTag extends React.Component<React.HTMLAttributes, {}>  {
  render(): JSX.Element {
    let props: React.HTMLAttributes = {};
    if (this.context && this.context.MyInput) this.context.MyInput.modifyInputTagProps(props);
    Object.assign(props, this.props);
    if (!props.type) props.type = 'text';
    return React.createElement('input', props);
  }
  context: IFieldContext;
  static contextTypes = { MyInput: React.PropTypes.any };
}

//************** FormLow
export abstract class FormLow<T extends FormLowStore, P> extends flux.Component<T, P> { }

export abstract class FormLowStore extends flux.Store<{}>  {
  static register(form: FormLowStore, input: TFieldLowStore, isRegister: boolean) {
    if (!form) return;
    if (isRegister) {
      form.$inputs.push(input);
    } else {
      let idx = form.$inputs.indexOf(input); if (idx >= 0) form.$inputs = form.$inputs.slice(idx);
    }
  }

  $inputs: Array<TFieldLowStore> = [];

  validate(completed: (errors: Array<TFieldLowStore>) => void) {
    let res: Array<TFieldLowStore> = [];
    let obss = rx.Observable.from(this.$inputs.map(inp => rx.Observable.create((obs: rx.Subscriber<TFieldLowStore>) => {
      inp.validate(err => { obs.next(inp); obs.complete(); }); return () => { };
    }))).mergeAll() as rx.Observable<TFieldLowStore>;
    obss.subscribe((inpRes: TFieldLowStore) => { if (inpRes.error) res.push(inpRes); }, err => new flux.Exception(err.toString()), () => completed(res.length == 0 ? null : res));
  }
  reset() { this.$inputs.forEach(inp => inp.reset()); }
}
