﻿import * as flux from '../react-framework/exports';
import * as testRF from './test-react-framework/app';
import * as rf01 from './test-react-framework/rf01';
import * as rf02 from './test-react-framework/rf02';
import * as rf03 from './test-react-framework/rf03';
import * as rf04 from './test-react-framework/rf04';
import * as rf05 from './test-react-framework/rf05';
import * as rf06 from './test-react-framework/rf06';
import * as rf061 from './test-react-framework/rf061';
import * as rf07 from './test-react-framework/rf07';
import * as semantic from './test-react-semantic/app';

export function init() {
  flux.Tests.tests = {
    rf01: { descr: 'Hallo world', storeAppClass: rf01.AppStore },
    rf02: { descr: 'Router par', storeAppClass: rf02.AppStore },
    rf03: { descr: 'Async route par', storeAppClass: rf03.AppStore },
    rf04: { descr: 'Component\'s $store', storeAppClass: rf04.AppStore },
    rf05: { descr: 'Sync and async action', storeAppClass: rf05.AppStore },
    rf06: { descr: 'Routing: subNavigate', storeAppClass: rf06.AppStore },
    rf061: { descr: 'Parent-child properties', storeAppClass: rf061.AppStore },
    rf07: { descr: 'Combined routing', storeAppClass: rf07.AppStore },
    //test1: { descr: 'Test React framework', storeAppClass: testRF.AppStore },
    //test2: { descr: 'Test React Semantic', storeAppClass: semantic.AppStore },
    //test2: { descr: 'Test React framework 2', storeAppClass: testRF.AppStore, resetServer: compl => setTimeout(() => compl(), 1000) }
  };
}