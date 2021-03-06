﻿//import * as React from 'react';
//import * as ReactDOM from 'react-dom';
//import * as flux from '../../react-framework/exports';

//import {RouteHook} from '../../react-framework/exports';

//var moduleId = 'RFTest';

////****************** Main Entry Point
//export function init() {
//  flux.StoreApp.bootApp(AppStore);
//}

////****************** App Store
//@flux.StoreDef({ moduleId: moduleId })
//export class AppStore extends flux.StoreApp {
//  getStartRoute(): flux.TRouteActionPar {
//    return flux.createRoute(AppRootStore, null,
//      flux.createRoute<IChildRouteActionPar>(ChildStore, { title: 'Child1' }),
//      { otherHook: flux.createRoute<IChildRouteActionPar>(ChildStore, { title: 'Child2' }) });
//  }
//  getIsHashRouter(): boolean { return true; }
//  //login
//  getLoginRoute(returnUrl: flux.TRouteActionPar): flux.TRouteActionPar { return flux.createRoute<ILoginRouteActionPar>(LoginStore, { returnUrl: flux.encodeFullUrl(returnUrl) }); }
//  getIsLogged(): boolean { return this.isLogged; }
//  //permanentni app state infos. Zachovaji se pri browser back x forward
//  isLogged = false;
//}

////****************** Login page
////export interface IStoreLogin extends flux.IStore { returnUrl: string }
//export interface IPropsExLogin { returnUrl?: string }

//export class Login extends flux.Component<LoginStore, IPropsExLogin> { }

//export interface ILoginRouteActionPar extends IPropsExLogin { }

//@flux.StoreDef({ moduleId: moduleId, componentClass: Login, loginNeeded: false })
//export class LoginStore extends flux.Store<IPropsExLogin> {

//  doDispatchAction(id: number, par: flux.IActionPar, completed: flux.TExceptionCallback) {
//    switch (id) {
//      case TActions.login:
//        (flux.store as AppStore).isLogged = true;
//        flux.navigate(flux.decodeFullUrl(this.returnUrl));
//        break;
//    }
//  }
//  initFromRoutePar(routePar: ILoginRouteActionPar) { this.returnUrl = routePar.returnUrl; }
//  returnUrl: string;
//  render(): JSX.Element {
//    return <div>
//      <a href='#' onClick={ev => this.clickAction<ILoginRouteActionPar>(ev, TActions.login, 'login', { returnUrl: this.returnUrl }) }>LOGIN</a>
//    </div>;
//  }
//}

////****************** AppRoot component
////export interface IStoreApp extends flux.IStore { title: string }
//export interface IPropsExApp { title?: string }
//export class AppRoot extends flux.Component<AppRootStore, IPropsExApp> { }

//enum TActions { appClick, childClick, navigate, login };//, refreshState };

//@flux.StoreDef({ moduleId: moduleId, componentClass: AppRoot })
//export class AppRootStore extends flux.Store<IPropsExApp> {
//  constructor($parent: flux.TStore) {
//    super($parent);
//    this.routeHookDefault = new flux.RouteHookStore(this, '1');
//    this.otherHook = new flux.RouteHookStore(this, '2');
//  }

//  //title: string = 'Hello world'
//  routeHookDefault: flux.RouteHookStore;
//  otherHook: flux.RouteHookStore;
//  doDispatchAction(id: number, par: flux.IActionPar, completed: flux.TExceptionCallback) {
//    switch (id) {
//      case TActions.appClick:
//        setTimeout(() => { this.modify(st => st.$props.title += 'x'); completed(null); }, 200);
//        break;
//      //case TActions.refreshState:
//      //  var stateStr = flux.appStateToJSON(flux.store, 2);
//      //  ReactDOM.unmountComponentAtNode(document.getElementById('app'));
//      //  history.pushState(null, null, 'http://localhost:53159/apps/test-react-framework/index.html');
//      //  setTimeout(() => flux.StoreApp.bootApp(JSON.parse(stateStr)), 1000);
//      //  break;
//      case TActions.navigate:
//        flux.navigate(
//          flux.createRoute(AppRootStore, null,
//            flux.createRoute<IChildRouteActionPar>(ChildStore, { title: 'NavigateChild1' }),
//            { otherHook: flux.createRoute<IChildRouteActionPar>(ChildStore, { title: 'NavigateChild2' }) }),
//          completed
//        );
//        break;
//      default:
//        super.doDispatchAction(id, par, completed)
//    }
//  }
//  render(): JSX.Element {
//    return <div>
//      <h2 onClick={ev => this.clickAction(ev, TActions.appClick, 'appCLick') }>{this.$props.title}</h2>
//      <a href='#' onClick={ev => this.clickAction(ev, TActions.navigate, 'navigate') }>Navigate</a>
//      <hr/>
//      <Child title='Not routed child'/>
//      <hr/>
//      <RouteHook $store={this.routeHookDefault}/>
//      <hr/>
//      <RouteHook $store={this.otherHook}/>
//      <hr/>
//      {/*
//      */}
//    </div>;
//  }
//}

////****************** Child component
////export interface IStoreChild extends flux.IStore { title: string }
//export interface IPropsExChild { title?: string }

//export class Child extends flux.Component<ChildStore, IPropsExChild> { }

//export interface IChildRouteActionPar { title: string; }

//@flux.StoreDef({ moduleId: moduleId, componentClass: Child, loginNeeded: true })
//export class ChildStore extends flux.Store<IPropsExChild> {
//  title: string;
//  doDispatchAction(id: number, par: flux.IActionPar, completed: flux.TExceptionCallback):Promise<any> {
//    switch (id) {
//      case TActions.childClick:
//        if (this.$parent instanceof flux.RouteHookStore) {
//          return (this.$parent as flux.RouteHookStore).subNavigate<IChildRouteActionPar>(this.getMeta().classId, { title: this.title += 'x' }, res => res instanceof Error ? completed(res) : completed(null));
//        } else {
//          this.modify(st => st.title += 'x');
//          return Promise.resolve();
//          //completed(null);
//        }
//      default:
//        return super.doDispatchAction(id, par, completed)
//    }
//  }
//  asyncConstructor() { return new Promise<{}>(res => setTimeout(() => res(null), 200)); }
//  initFromRoutePar(routePar: flux.IActionPar) { Object.assign(this, routePar);}
//  render(): JSX.Element {
//    return <h3 onClick={ev => this.clickAction(ev, TActions.childClick, 'childClick') }>{this.$props.title}</h3>;
//  }
//}

////interface IStorex { instanceId: string; }
////interface IPropsEx { instanceId?: string; }
////interface IPropsx<T extends Storex> { state: T; }

////class Storex implements IStorex { instanceId: string; }
////class Component<T extends Storex, P extends IPropsEx> extends React.Component<IPropsx<T> & P, any>{ }

////interface IStoreChildx extends IStorex { title: string; }
////interface IChilsPropsEx extends IPropsEx { title?: string; }
////class StoreChildx extends Storex implements IStoreChildx { title: string; }
////export class Childx extends Component<StoreChildx, IChilsPropsEx>{ }

////var ch = <Childx state={null}/>

//declare var __extends: any;
//__extends(Component, React.Component);
//function Component(props, ctx) {
//  React.Component.call(this, props, ctx);
//  props.state.trace('create');
//  props.state.subscribe(this);
//}
//Component.prototype.componentWillUnmount = function () {
//  //undo adjustComponentState
//  if (this.props.$parent && this.props.$parent.childStores && this.props.state)
//    delete this.props.$parent.childStores[this.props.state.getIdInParent()];
//  this.props.state.unSubscribe(this);
//  this.props.state.trace('destroy');
//};
//Component.prototype.render = function () {
//  return this.props.state.render();
//};

