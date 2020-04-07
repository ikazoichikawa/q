const {Builder, Browser, Capabilities, logging} = require('selenium-webdriver');
const {Options} = require('selenium-webdriver/chrome');

(async () => {

    // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Browser.html
    var str_browserName = Browser.CHROME;

    // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/logging.html
    var obj_logPrefs = new logging.Preferences();
    obj_logPrefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

    // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_ThenableWebDriver.html
    var obj_builder = await new Builder()
        .withCapabilities(
            new Capabilities()
                .setBrowserName(str_browserName)
                .setLoggingPrefs(obj_logPrefs)
        )
        // .setChromeOptions(
        //     new Options()
        //         .setPreference('log', 'trace')
        // )
    ;

    console.log('<Content of Builder object>----------------------------------');
    console.log('<Builder>---------------');
    console.log(obj_builder);
    console.log('<Preferences>---------------');
    console.log(obj_builder['capabilities_']['map_'].get('goog:loggingPrefs'));
    // console.log('<Object>---------------');
    // console.log(obj_builder['firefoxOptions_'].get('moz:firefoxOptions'));
    console.log('----------------------------------</Content of Builder object>');

    var obj_webDriver = obj_builder
        .build()
    ;

    // Set screen resolution as XGA size
    await obj_webDriver.manage().window().setRect({
        width:1024,
        height:768
    });

    // Navigate to
    await obj_webDriver.get('https://firefox-source-docs.mozilla.org/testing/geckodriver/TraceLogs.html');

    // `console.log()`
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
                .then(entries => {
                    entries.forEach( entry => {

                        console.log('[%s] %s', entry.level.name, entry.message);

                        // note
                        // .message には、以下のように console.log() に渡した文字列以外も付加されている。
                        // `console-api 2:32 "hello console"`
                        if(entry.message.indexOf(str_expectedString) != (-1)){
                            console.log("OK");
                            bl_gotLog = true;
                        }
                    });
                })
            ;

            return bl_gotLog;

        },int_waitMS)
        .catch(function(e){

            console.error('<exception caught!>----------------------------');

            // note 
            // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_ThenableWebDriver.html
            // ↑ Interface ThenableWebDriver の説明↑ では time out 時に TypeError が throw されるとあるが、
            // 実際は`Class TimeoutError`(<- `Class WebDriverError` の sub class)。
            // なのでこのエラーを判定を判定する方法は ↓↓ になる
            if( (typeof e) === 'object' && e.constructor.name === "TimeoutError"){
                console.log("NG");
            
            }else{
                throw e;
            }
        })
    ;

})();
