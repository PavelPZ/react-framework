﻿import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as flux from '../../react-framework/exports';

import {RouteHook, Dummy, DummyStore} from '../../react-framework/exports';

var moduleId = 'RF08';

//****************** Main Entry Point
export function init() {
  flux.StoreApp.bootApp(AppStore);
}

//****************** App Store
@flux.StoreDef({ moduleId: moduleId })
export class AppStore extends flux.StoreApp {
  getStartRoute(): flux.TRouteActionPar { return flux.createRoute(AppRootStore); }
  getIsHashRouter(): boolean { return true; } //hash URL format
}

enum TActions { click, click2 };

//****************** AppRoot component
export class AppRoot extends flux.Component<AppRootStore, {}> { }

@flux.StoreDef({ moduleId: moduleId, componentClass: AppRoot })
export class AppRootStore extends flux.Store<{}> {

  constructor(p, i) {
    super(p, i);
    //this.dummy = new DummyStore(this, 'dummy');
    //this.dummy2 = new DummyStore(this, 'dummy2'); //this.dummy2.animIsOut = false;
  }

  render(): JSX.Element {
    return <div>
      <a href='#' onClick={ev => this.clickAction(ev, TActions.click, 'click') }>Toggle</a>
      {this.hidden ? null : <Dummy $store={this.dummy} $animation={{ in: flux.transition.expandIn, inDuration: 500 }} $store2={st => this.dummy = st ? st : this.dummy} id='dummy' >
        <div style={{ width: '200px', border: '1px solid black' }} >
          <h2>Title</h2>
          <p>Content</p>
        </div>
      </Dummy>}
      <hr/>
      <a href='#' onClick={ev => this.clickAction(ev, TActions.click2, 'click2') }>Toggle</a>
      <Dummy $store={this.dummy2} $animation={{ in: flux.transition.expandIn, inDuration: 500 }} $store2={st => this.dummy2 = st ? st : this.dummy2} id='dummy2'>
        <div style={{ width: '200px', border: '1px solid black' }} >
          <h2>Title</h2>
          <p>Content</p>
        </div>
      </Dummy>
    </div>;
  }
  doDispatchAction(id: TActions, par: flux.IActionPar, completed: flux.TExceptionCallback) {
    switch (id) {
      case TActions.click:
        //as modal dialog: create and remove with animation efect
        if (this.hidden) {
          //create Dummy component
          this.modify(st => st.hidden = false);
          //subscribe musi byt az po this.modify, $onDidMount se vytvari v didMount
          this.dummy.$onDidMount.subscribe(null, null, () => completed(null)); //callback after mount and enter animation
        } else {
          //animation out and remove Dummy component
          this.dummy.$animation.out(() => {
            this.modify(st => st.hidden = true);
            completed(null);
          });
        }
        break;
      case TActions.click2:
        //just change target animation status
        this.dummy2.$animation.toggle(() => completed(null));
        break;
      default: super.doDispatchAction(id, par, completed); break;
    }
  }
  dummy: DummyStore;
  hidden: boolean;
  dummy2: DummyStore;
}

