
import puppeteer from "puppeteer";

async function getTasksFromTrello(){

  const browser = await puppeteer.launch({headless: "new"});

  const page = await browser.newPage();
  await page.goto('https://trello.com/b/QvHVksDa/personal-work-goals');

  const data = await page.evaluate(() => {

    const list = document.querySelectorAll('[data-testid="list-wrapper"]');
    var tasks={};
    for (i=0;i<list.length;i++){
      taskItems={}
      let title=list[i].querySelector('h2').innerHTML;
      const items=list[i].querySelectorAll('li[data-testid="list-card"] a');
      
      for (j=0;j<items.length;j++){
        let itemText=items[j].text;
        taskItems[itemText]=itemText;
      }

      tasks[title]={
        title,
        taskItems
      };

    }
    
    let description = document.querySelector("p").innerText;

    return {
      list:list.length,
      description,
      tasks
    };

  });
console.log(data);
  await browser.close();
}

getTasksFromTrello();
