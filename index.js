import puppeteer from "puppeteer";
import fs from 'fs';

async function getTasksFromTrello() {
  // const browser = await puppeteer.launch({ headless: "new" });

  const browser = await puppeteer.launch({
    slowMo: 200,
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`
    ]
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto("https://trello.com/b/QvHVksDa/personal-work-goals");

  const data = await page.evaluate(() => {
    const list = document.querySelectorAll('[data-testid="list-wrapper"]');
    var tasks = {};
    for (i = 0; i < list.length; i++) {
      taskItems = {};
      let title = list[i].querySelector("h2").innerHTML;
      const items = list[i].querySelectorAll('li[data-testid="list-card"] a');

      for (j = 0; j < items.length; j++) {
        let itemText = items[j].text;
        taskItems[itemText] = itemText;
      }

      tasks[title] = {
        title,
        taskItems,
      };
    }

    let description = document.querySelector("p").innerText;

    return {
      list: list.length,
      description,
      tasks,
    };
  });

  await page.goto("https://todoist.com/auth/login", {
    waitUntil: "load",
    timeout: 0,
  });

    //type="email"
    await page.type("input[type=email]", "salvador.soto.qro@gmail.com");
    //type="password"
    await page.type("input[type=password]", "Pruebatest,2023");
    await Promise.all([
      page.click("button[type=submit]"),
      //cookies = await page.cookies(),
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
  
    ]);

    let tasksToSearch=data["tasks"];
    let counter=1;
    await Object.keys(tasksToSearch).forEach((key)=>{
      const titleToAdd=tasksToSearch[key]['title'];
      let taskItemsToSearch=tasksToSearch[key]['taskItems'];
      let itemToADD='';
      Object.keys(taskItemsToSearch).forEach((key)=>{
        itemToADD=taskItemsToSearch[key];
        return true;
      });
  
      if(counter==5){
        return true;
      }else{
        setTaskTodoist(page,titleToAdd,itemToADD);
        itemToADD ++
      }
    });

  await browser.close();
}



async function setTaskTodoist(page,title,task){
  await page.click('a[aria-label="Añadir tarea"]');
  page.waitForNavigation({ waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    let todoTitle= document.querySelector('.task_editor__input_fields [data-placeholder="Nombre de la tarea"]');
    todoTitle.innerHTML=title;

    let todoDescription= document.querySelector('.task_editor__input_fields [aria-label="Descripción"]');
    todoDescription.innerHTML=task;

  });
  
  await page.click('button[data-testid="task-editor-submit-button"]');
  page.waitForNavigation({ waitUntil: 'networkidle0' });
await new Promise((resolve) => setTimeout(resolve, 1500));
}

getTasksFromTrello();
