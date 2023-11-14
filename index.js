import puppeteer from "puppeteer";

async function getTasksFromTrello() {
  //const browser = await puppeteer.launch({ headless: "new" });

  //Start browser
  const browser = await puppeteer.launch({
    slowMo: 200,
    headless: false,
  });
  //Create a ew page
  const page = await browser.newPage();
  //Set timeout to limitless
  await page.setDefaultNavigationTimeout(0);
  //Go to the trello page and wait to load
  await page.goto("https://trello.com/b/QvHVksDa/personal-work-goals", {
    waitUntil: "load",
    timeout: 0,
  });

  //Evaluate page to get la list column
  const data = await page.evaluate(() => {
    //Get all the trello columns
    const list = document.querySelectorAll('[data-testid="list-wrapper"]');
    var tasks = {};
    //Loop through the trello colimns and find the tasks
    for (i = 0; i < list.length; i++) {
      taskItems = {};
      let title = list[i].querySelector("h2").innerHTML;
      const items = list[i].querySelectorAll('li[data-testid="list-card"] a');

      //Loop to get the tasks
      for (j = 0; j < items.length; j++) {
        let itemText = items[j].text;
        taskItems[itemText] = itemText;
      }
      //Set each item object to set data
      tasks[title] = {
        title,
        taskItems,
      };
    }

    //Get the description
    let description = document.querySelector("p").innerText;

    //return the object with data from trello
    return {
      list: list.length,
      description,
      tasks,
    };
  });

  //Create a new page
  const page2 = await browser.newPage();
  //Go to the login page of todoist site
  await page2.goto("https://todoist.com/auth/login", {
    waitUntil: "load",
    timeout: 0,
  });

  //Set the username
  await page2.type("input[type=email]", "salvador.soto.qro@gmail.com");
  //Set the password
  await page2.type("input[type=password]", "Pruebatest,2023");
  await Promise.all([
    //Login and wait for login success
    page2.click("button[type=submit]"),
    page2.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);
  //Get the tasks from trello data
  let tasksToSearch = data["tasks"];
  let counter = 1;

  //Loop through the trello data titles
  for (const key of Object.keys(tasksToSearch)) {
    let titleToAdd = String(tasksToSearch[key]["title"]);
    let taskItemsToSearch = tasksToSearch[key]["taskItems"];
    let itemToADD = "";

    //Loop through the trello tasks
    for (const key2 of Object.keys(taskItemsToSearch)) {
      console.log(taskItemsToSearch[key2]);
      itemToADD = String(taskItemsToSearch[key2]);
      break;
    }

    //Check for 5 tasks only with the counter
    if (counter == 6) {
      return false;
    } else {
      console.log("before todolist" + titleToAdd + "=>" + itemToADD);
      //Call the create task in todoist function
      await setTaskTodoist(page2, titleToAdd, itemToADD);

      //increase the counter
      counter++;
    }
  }
  //await new Promise((resolve) => setTimeout(resolve, 1500));
  await browser.close();
}

//Function to save the tasks in todoist
async function setTaskTodoist(page, title, task) {
  //Click on add task button
  await page.click('a[aria-label="Añadir tarea"]');
  page.waitForNavigation({ waitUntil: "networkidle0" });

  //Enter evcaluate on page
  await page.evaluate(
    (title, task) => {
      //Set the task title
      let todoTitle = document.querySelector(
        '.task_editor__input_fields [data-placeholder="Nombre de la tarea"]'
      );
      todoTitle.innerHTML = title;

      //Set the task description
      let todoDescription = document.querySelector(
        '.task_editor__input_fields [aria-label="Descripción"]'
      );
      todoDescription.innerHTML = task;
    },
    title,
    task
  );

  //Submit butto click to add task
  await page.click('button[data-testid="task-editor-submit-button"]');

  //Wait to finish navigation
  page.waitForNavigation({ waitUntil: "networkidle0" });
}

getTasksFromTrello();
