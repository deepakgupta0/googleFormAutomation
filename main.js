// FOR AUTOMATION PURPOSE
const puppeteer = require("puppeteer");
// IMPORTING QUESTIONS THAT ARE TO BE INCLUDED IN FORM GIVEN AS PER USER
const { questions } = require("./questions");
//IMPORTING FORMATTING FOR FORMS GIVEN AS PER USER
const { formConfig } = require("./formConfig");
//IMPORTING EMAIL LIST
const { emailList } = require("./emailList");
//IMPORTING EMAIL CONFIG
const { config } = require("./emailConfig");

//USING ENVIRONMENT VARIABLES FOR STORING EMAIL , PASSWORD
require('dotenv').config()

// FORM HEADING
const heading = "TESTING FORM";

//LAUNCHING CHROME
let browserOpenPromise = puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args: ["--start-maximized"],
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
});

let gpage;

browserOpenPromise.then(function (browserInstance) {
    //GETTING ALL OPEN TABS, CURRENTLY ONLY 1
    let allTabPromises = browserInstance.pages();
    return allTabPromises;
}).then(function (tabs) {
    //ACCESSING THAT OPEN TAB
    gpage = tabs[0];
    let formPage = gpage.goto("https://www.google.com/forms/about/")
    // console.log("Reached At Forms");
    return formPage;
})
    .then(function () {
        // WAITING FOR ELEMENT TO GET RENDER ON DOM AND THEN CLICKING
        return waitAndClick(".mobile-device-is-hidden.js-dropdown-toggle");
    })
    .then(function () {
        let waitForEmailBox = gpage.waitForSelector("input[type = 'email']", { visible: true });
        return waitForEmailBox;
    })
    .then(function () {
        return gpage.type("input[type = 'email']", process.env.EMAIL, { delay: 100 });
    })
    .then(function () {
        //CLICKING ON SIGN IN BUTTON
        return gpage.click('button[jsname="LgbsSe"]');
    })
    .then(function () {
        let waitForPasswordBox = gpage.waitForSelector("input[name = 'password']", { visible: true });
        return waitForPasswordBox;
    })
    .then(function () {
        return gpage.type("input[name = 'password']", process.env.PASSWORD, { delay: 100 });
    })
    .then(function () {
        //HITTING LOGIN BUTTON
        return gpage.click('button.VfPpkd-LgbsSe-OWXEXe-k8QpJ');
    })
    .then(function () {
        let waitForBlankForm = gpage.waitForSelector('img[src = "https://ssl.gstatic.com/docs/templates/thumbnails/forms-blank-googlecolors.png"]', { visible: true });
        return waitForBlankForm;
    })
    .then(function () {
        // MAKING NEW EMPTY FORM
        return gpage.click('img[src = "https://ssl.gstatic.com/docs/templates/thumbnails/forms-blank-googlecolors.png"]');
    })
    .then(function () {
        return gpage.waitForSelector('textarea[aria-label = "Form title"]');
    })
    .then(function () {
        return gpage.waitForTimeout(3000);
    })
    .then(function () {
        return gpage.click('.freebirdFormeditorViewQuestionFooterFooterRight div[data-action-id="freebird-delete-widget"]');
    })
    .then(function () {
        return gpage.waitForTimeout(2000);
    })
    .then(function () {
        return gpage.evaluate(() => {
            //ERASING THE PRE WRITTEN TEXT
            const title = document.querySelector("textarea[aria-label = 'Form title']");
            title.value = '';
        });
    })
    .then(function () {
        // SETTING UP NEW HEADING
        return gpage.type("textarea[aria-label = 'Form title']", heading, { delay: 100 });
    })
    .then(function () {
        // MAKING A PROMISE WHICH WILL ADD QUESTIONS FROM question.js TO FORM
        let makeQuestionsPromise = makeQuestions(questions[0]);
        for (let i = 1; i < questions.length; i++) {
            makeQuestionsPromise = makeQuestionsPromise.then(function () {
                return makeQuestions(questions[i], i);
            });
        }
        return makeQuestionsPromise;
    })
    .then(function () {
        //GETTING THE COLOR PALETTE
        return gpage.click('div[guidedhelpid = "paletteGH"]');
    })
    .then(function () {
        // SETTING UP THE COLOR GIVEN BY USER FROM formConfig.js
        let colorChooser = `div[data-color="${formConfig.color}"]`
        return gpage.click(colorChooser);
    })
    .then(function () {
        return gpage.click('.freebirdFormeditorSidebarThemeSection div[role="listbox"]');
    })
    .then(function () {
        // return gpage.waitForSelector('.exportSelectPopup.quantumWizMenuPaperselectPopup')
        return gpage.waitForTimeout(2000);

    })
    .then(function () {
        // SETTING UP THE FONT GIVEN BY USER FROM formConfig.js
        return gpage.click('.freebirdFormeditorSidebarThemeSection div[role="option"][data-value="1"]');
    })
    .then(function () {
        return gpage.waitForTimeout(2000);
    })
    .then(function () {
        //CLICKING ON SEND BUTTON
        return gpage.click('div[data-action-id = "freebird-send-form"]');
    })
    .then(function () {
        let emailEnterPromise = emailEnter(emailList[0]);
        for (let i = 1; i < emailList.length; i++) {
            emailEnterPromise = emailEnterPromise.then(function () {
                return emailEnter(emailList[i]);
            })
        }
        return emailEnterPromise;
    })
    .then(function () {
        return gpage.click('input[aria-label ="Subject"]');
    })
    .then(function () {
        return gpage.$eval('input[aria-label ="Subject"]', e1 => e1.value = '');
    })
    .then(function () {
        console.log(config.emailSubject);
        return gpage.type('input[aria-label ="Subject"]', config.emailSubject);
    })
    .then(function () {
        //SEND EMAIL
        return gpage.click('div[jsname="Pa7pyf"]');
    })
    .then(function () {
        console.log("end");
    })
    .catch(function (err) {
        console.log(err);
    })


// MY OWN PROMISE MADE FOR ADDING QUESTIONS IN FORM FROM questions.js
function makeQuestions(questionMap) {
    // console.log(questionMap);
    return new Promise(function (resolve, reject) {
        // ADDING QUESTION BOX
        let addQuestionFromBox1 = gpage.click('div[data-action-id="freebird-add-last-field"]');
        addQuestionFromBox1
            .then(function () {
                //ADDING QUESTION 1
                return gpage.type("textarea[aria-label='Question title']", questionMap["qName"], { delay: 100 });
            })
            .then(function () {
                //HITTING 3 TABS SO THAT WE CAN COME ON ANSWERS PART
                let tabPromise = tabPress();
                for (let i = 1; i < 3; i++) {
                    tabPromise = tabPromise.then(function () {
                        return tabPress();
                    })
                }
                return tabPromise;
            })
            .then(function () {
                return gpage.waitForTimeout(3000);
            })
            //BYDEFAULT OPTION 1 IS WRITTEN, SO REMOVING THAT FIRST
            .then(function () {
                return gpage.keyboard.down('Control');
            })
            .then(function () {
                return gpage.keyboard.press('a');
            })
            .then(function () {
                return gpage.keyboard.up('Control');
            })
            .then(function () {
                return gpage.keyboard.press('Backspace');
            })
            //ADDING ANSWERS FROM questions.js
            .then(function () {
                return gpage.type('input[value="Option 1"]', questionMap["soln1"], { delay: 100 });
            })
            .then(function () {
                return gpage.keyboard.press('Enter');
            })
            .then(function () {
                return gpage.type('input[value="Option 2"]', questionMap["soln2"], { delay: 100 });
            })
            .then(function () {
                return gpage.keyboard.press('Enter');
            })
            .then(function () {
                return gpage.type('input[value="Option 3"]', questionMap["soln3"], { delay: 100 });
            })
            .then(function () {
                return gpage.click('.freebirdFormeditorViewPageTitleAndDescription')
            })
            .then(function () {
                resolve();
            }).catch(function () {
                reject();
            })
    })
}

// MY OWN PROMISE WHICH IS USED FOR RENDERING ELEMENTS ON DOM AND THEN CLICKING ON IT
function waitAndClick(selector) {
    return new Promise(function (resolve, reject) {
        let waitForElementPromise = gpage.waitForSelector(selector, { value: true });
        waitForElementPromise
            .then(function () {
                return gpage.click(selector);
            }).then(function () {
                resolve();
            }).catch(function () {
                reject();
            })
    })
}

//MY OWN PROMISE FOR HITTING TABS(BY DOING SO I HAVE REDUCED REPETITION IN MY CODE)
function tabPress() {
    return new Promise(function (resolve, reject) {
        let tabPressPromise = gpage.keyboard.press("Tab");
        tabPressPromise
            .then(function () {
                resolve();
            })
            .catch(function () {
                reject();
            })
    })
}

function emailEnter(emailId) {
    return new Promise(function (resolve, reject) {
        let whomToEmail = gpage.type('input[aria-label = "To"]', emailId, { delay: 100 });
        whomToEmail.then(function () {
            return gpage.keyboard.type(" ");
        })
            .then(function () {
                resolve();
            })
            .catch(function () {
                reject();
            })
    })
}