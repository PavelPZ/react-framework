﻿import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as flux from '../../react-framework/exports';
import * as cfg from '../../apps/test-config';

//******************* GUI for Dump
var moduleId = 'testingRightPanel';

export function init() { }

@flux.StoreDef({ moduleId: moduleId })
export class AppStore extends flux.StoreApp {
}

//****************** AppRoot component
export class AppRoot extends flux.Component<AppRootStore> { }

export enum AppRootMode { export, import, dump }
export interface IAppRootRouteActionPar { mode: AppRootMode; dumpKey: string; }

@flux.StoreDef({ moduleId: moduleId, componentClass: AppRoot })
class AppRootStore extends flux.Store implements IAppRootRouteActionPar {
  dumpKey: string;
  mode: AppRootMode;
  prepareBindRouteToStore(par: flux.IActionPar, completed: flux.TExceptionCallback) {
    Object.assign(this, par as IAppRootRouteActionPar); completed(null);
  }
  import(ev: React.MouseEvent) {
    ev.preventDefault();
    try {
      var src = JSON.parse(this.input.value);
      flux.saveAllRecordings(src);
      this.input.value = '**** done *****';
    } catch (msg) {
      alert('Wrong JSON format');
    }
  }
  input;
  render(): JSX.Element {
    switch (this.mode) {
      case AppRootMode.export:
      case AppRootMode.dump:
        var txt = this.mode == AppRootMode.dump ? flux.getRecording(this.dumpKey) : flux.getAllRecordings();
        return <pre><code>{txt}</code></pre>;
      case AppRootMode.import:
        return <div>
          <br/>
          <div>Paste exported JSON here and click <a href='#' onClick={this.import.bind(this)}><b>Import</b></a></div>
          <br/>
          <textarea ref= {c => this.input = c} rows='40' style={{ width: '99%' }}></textarea>
        </div>;
      default:
        return null;
    }
  }
}

//**************** inter panel communication
export class RightClient {
  test() { alert('RightClient.call'); }
  get store(): flux.StoreApp { return flux.store; }
  init(key: string, compl?: flux.TExceptionCallback) {
    if (!key) { flux.StoreApp.bootApp(null); if (compl) compl(null); return; }
    var test = cfg.tests[key];
    var boot = () => flux.StoreApp.bootApp(test.storeAppClass, compl, test.startUrl ? test.startUrl : null /*default route*/);
    if (test.resetServer) test.resetServer(boot); else boot();
  }
  startRecording() { flux.store.$recorder.startRecording(); }
  saveRecording(key: string) { flux.store.$recorder.saveRecording(key); }
  hasRecording(key: string) { return flux.hasRecording(key); }
  startPlaying(key: string, progress: (pos: number, len: number) => void, completed: flux.TExceptionCallback) { flux.startPlaying(key, progress, completed); }
  service(mode: AppRootMode, dumpKey?: string) { flux.StoreApp.bootApp(AppStore, null, flux.createRoute<IAppRootRouteActionPar>(AppRootStore, { mode: mode, dumpKey: dumpKey })); }
}
export var rightClient = new RightClient();
