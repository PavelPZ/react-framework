﻿import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as flux from '../../react-framework/exports';
import {InputSmart, InputSmartStore, InputTag, RadiosStore} from '../../react-framework/exports';
import * as uiForms from '../../react-semantic/behaviors/forms';
import {FormSmart, FormSmartStore, CheckBox, CheckBoxStore, FieldSmart, FieldSmartStore, Radio } from '../../react-semantic/behaviors/forms';
import {Fields, Field } from '../../react-semantic/common/exports';

var moduleId = 'UI02';

uiForms.initDefaultTemplates();

enum TActions { validate, reset }

//****************** Main Entry Point
export function init() {
  flux.StoreApp.bootApp(AppStore);
}

//****************** App Store
@flux.StoreDef({ moduleId: moduleId })
export class AppStore extends flux.StoreApp {
  getStartRoute(): flux.TRouteActionPar { return flux.createRoute(AppRootStore); }
  getIsHashRouter(): boolean { return true; }
}

//****************** AppRoot component
export class AppRoot extends flux.Component<AppRootStore, {}> { }

@flux.StoreDef({ moduleId: moduleId, componentClass: AppRoot })
export class AppRootStore extends flux.Store<{}> {

  constructor(parent, id) {
    super(parent, id);
    this.form = new FormSmartStore(this, 'form');
    this.num = new FieldSmartStore(this, 'num');
    this.firstName = new FieldSmartStore(this, 'firstName');
    this.lastName = new FieldSmartStore(this, 'lastName');
    this.radios = new RadiosStore(this, 'radios');
    this.checkBox = new CheckBoxStore(this, 'checkBox');
  }

  render(): JSX.Element {
    return <div>
      <FormSmart $store={this.form}>
        <Field key={1}>
          <CheckBox $title='Check Box' $store={this.checkBox} $validator={flux.requiredBoolValidator() } />
        </Field>
        <Fields $inline key={2}>
          <Field key={1}><Radio $parent={this.radios} id='r1' $title='r1 title' $defaultValue/></Field>
          <Field key={2}><Radio $parent={this.radios} id='r2' $title='r2 title'/></Field>
        </Fields>
        <Fields $equalWidth key={3}>
          <FieldSmart $title='First Name' $store={this.firstName} $required $validator = {flux.requiredValidator() } />
          <FieldSmart $title='Last Name' $store={this.lastName} $required $validator = {flux.requiredValidator() } />
          <FieldSmart $title='Name' $defaultValue='3' $store={this.num} />
        </Fields>
      </FormSmart>
      <hr/>
      <a href='#' onClick={ev => this.clickAction(ev, TActions.validate, 'validate') }>Validate</a> |
      <a href='#' onClick={ev => this.clickAction(ev, TActions.reset, 'reset') }>Reset</a>
    </div>;
  }
  form: FormSmartStore;
  num: FieldSmartStore;
  firstName: FieldSmartStore;
  lastName: FieldSmartStore;
  radios: RadiosStore;
  checkBox: CheckBoxStore;

  doDispatchAction(id: TActions, par: flux.IActionPar, completed: flux.TExceptionCallback) {
    switch (id) {
      case TActions.validate: this.form.validate(res => completed(null)); break;
      case TActions.reset: this.form.reset(); completed(null); break;
      default: super.doDispatchAction(id, par, completed); break;
    }
  }
}