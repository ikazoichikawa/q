# Selenium × Node.js × Firefox 環境でブラウザのコンソールログを取得したい

以下コードの `//<- point.1`,  `//<- point.2` の所のように、  
selenium-webdriver の Builder に対して ログ取得を有効化する設定をしていて、  
Logs.get() でコンソールログを取得できると期待していた(`//<- point.3` の所)のですが、  
`WebDriverError` が Throw されてしまいます。  (`//<- point.4` の所)

↓ 3-1and2.js ↓  (オリジナルは //todo 参照)  
```javascript
const {Builder, Browser, Capabilities, logging} = require('selenium-webdriver');
const {Options} = require('selenium-webdriver/firefox');

(async () => {

    var str_browserName = Browser.FIREFOX;

    var obj_logPrefs = new logging.Preferences();
    obj_logPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

    var obj_builder = await new Builder()
        .withCapabilities(
            new Capabilities()
                .setBrowserName(str_browserName)
                .setLoggingPrefs(obj_logPrefs) //<- point.1
        )
        .setFirefoxOptions(
            new Options()
                .setPreference('log', 'trace') //<- point.2
        )
    ;

    console.log('<Content of Builder object>----------------------------------');
    console.log('<Builder>---------------');
    console.log(obj_builder);
    console.log('<Preferences>---------------');
    console.log(obj_builder['capabilities_']['map_'].get('goog:loggingPrefs'));
    console.log('<Object>---------------');
    console.log(obj_builder['firefoxOptions_'].get('moz:firefoxOptions'));
    console.log('----------------------------------</Content of Builder object>');

    var obj_webDriver = obj_builder
        .build()
    ;

    await obj_webDriver.get('https://firefox-source-docs.mozilla.org/testing/geckodriver/TraceLogs.html');

    await obj_webDriver.executeScript('console.log(\'hello console\');');

    var str_expectedString = 'hello console';
    var int_waitMS = 3000;
    
    await obj_webDriver
        .wait(async () => {
            
            let bl_gotLog = false;

            await obj_webDriver
                .manage()
                .logs()
                .get(logging.Type.BROWSER)
                .then(entries => {              //<- point.3
                    entries.forEach( entry => {

                        console.log('[%s] %s', entry.level.name, entry.message);

                        if(entry.message.indexOf(str_expectedString) != (-1)){
                            console.log("OK");
                            bl_gotLog = true;
                        }
                    });
                })
            ;

            return bl_gotLog;

        },int_waitMS)
        .catch(function(e){                    //<- point.4

            console.error('<exception caught!>----------------------------');

            if( (typeof e) === 'object' && e.constructor.name === "TimeoutError"){
                console.log("NG");
            
            }else{
                throw e;
            }
        })
    ;

})();
```

↓ 実行結果 ↓  

```
>node 3-1and2.js
<Content of Builder object>----------------------------------
<Builder>---------------
Builder {
  log_: Logger {
    name_: 'webdriver.Builder',
    level_: null,
    parent_: Logger {
      name_: 'webdriver',
      level_: null,
      parent_: [Logger],
      handlers_: null
    },
    handlers_: null
  },
  url_: '',
  proxy_: null,
  capabilities_: Capabilities {
    map_: Map {
      'browserName' => 'firefox',
      'goog:loggingPrefs' => [Preferences]
    }
  },
  chromeOptions_: null,
  chromeService_: null,
  firefoxOptions_: Options {
    map_: Map {
      'browserName' => 'firefox',
      'moz:firefoxOptions' => [Object]
    }
  },
  firefoxService_: null,
  ieOptions_: null,
  ieService_: null,
  safariOptions_: null,
  edgeOptions_: null,
  edgeService_: null,
  ignoreEnv_: false,
  agent_: null
}
<Preferences>---------------
Preferences {
  prefs_: Map { 'browser' => Level { name_: 'ALL', value_: 0 } }
}
<Object>---------------
{ prefs: { log: 'trace' } }
----------------------------------</Content of Builder object>
<exception caught!>----------------------------
(node:1628) UnhandledPromiseRejectionWarning: WebDriverError: HTTP method not allowed
    at parseHttpResponse (C:\Users\****\Desktop\q\node_modules\selenium-webdriver\lib\http.js:582:11)
    at Executor.execute (C:\Users\****\Desktop\q\node_modules\selenium-webdriver\lib\http.js:491:26)
    at processTicksAndRejections (internal/process/task_queues.js:97:5)
    at async thenableWebDriverProxy.execute (C:\Users\****\Desktop\q\node_modules\selenium-webdriver\lib\webdriver.js:700:17)
    at async C:\Users\****\Desktop\q\3-1and2.js:59:13
(node:1628) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
(node:1628) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.

```

## やってみたこと

`//<- point.1`,  `//<- point.2`　の設定が競合しているのかと思ったので、  
以下2パターンを試してみましたが、同様に `WebDriverError` が Throw されてしまいます。  

 - `//<- point.1` だけ設定して `//<- point.2` は設定しない。 (//todo の `1-withCapabilities-setLoggingPrefs.js`)
 - `//<- point.1` は設定しないで `//<- point.2` だけ設定する。(//todo の `2-setFirefoxOptions-setPreference.js`)

また、Chrome(80.0.3987.149) × ChromeDriver 80.0.3987.106 であれば、  
`//<- point.1` だけ設定して `//<- point.2` は設定しない状態で、コンソールログが取得できる事を確認しました。  
、、Firefox はもっと違った実装が必要なんでしょうか？  

## 環境

Windows10 (64bit)  
Node.js v12.16.1  
selenium-webdriver 4.0.0-alpha.7  
Firefox 74.0.1(64bit)  
geckodriver 0.26.0  
