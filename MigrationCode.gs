function transformData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rawSheet = ss.getSheetByName("Raw"); // This is the sheet that contains your ClickUp Export 
  // Follow these instructions on how to export your data: https://help.clickup.com/hc/en-us/articles/6310551109527-Task-data-export
  var adoImportSheet = ss.getSheetByName("ADO_Import"); // This is the new sheet that will hold your data to import into Azure Dev Ops

  // We start by getting all of the values from the raw export
  var rawData = rawSheet.getDataRange().getValues();
  // These are the Headers that we will use in ADO_Import sheet. You can add or change these depending on your needs
  var adoData = [["ClickUp ID", "Work Item Type", "Title 1", "Title 2", "Title 3", "Title 4", "Priority", "Assigned To", "Description", "State", "Reason", "Target Date", "Closed Date"]];
  
  var standaloneTasks = [];
  var parentTasks = [];
  var subTasks = [];

  // Separate standalone tasks, parent tasks, and subtasks
  rawData.forEach((row, index) => {
    if (index === 0) return; // skip header
    var listName = row[15];
    // Only include X project tasks -- You may need to remove this or add to this if you only want to migrate over certian Tasks
    if(listName !== "X Projects") return; 
    var parentId = row[10];
    var priority = row[14];

    // Set Priority to 4 if ClickUp is "null"
    if (priority === "null") {
      row[14] = 4;
    }

    if (parentId != "null") {
      standaloneTasks.push(row); // A Standalone task means that there are no subtasks
    } else {
      parentTasks.push(row);
    }
  });

  // Create a map to link subtasks to their parents
  var taskMap = {};
  parentTasks.forEach((row) => {
    var taskId = row[0];
    taskMap[taskId] = {
      row: row,
      subtasks: []
    };
  });

  // Here we still do a safety check to ensure that there are no 
  // subtasks that got added by accident. There should be no subtasks for tasks that have a "null" parentId
  standaloneTasks.forEach((row) => {
    var parentId = row[10];
    if (taskMap[parentId]) {
      taskMap[parentId].subtasks.push(row);
    } else {
      // Handle orphan standalone tasks if necessary
    }
  });

  // Function to add tasks and subtasks to ADO_Import
  function addTasks(task, level) {
    var row = task.row;
    var newRow = [];

    // ID and Work Item Type
    newRow.push(row[0]);
    //newRow.push(level === 0 ? "Feature" : "Task"); 
    // We had a column in the ClickUp Export sheet that would override our 
    // Feature or Task notion. If you do not have this comment this out and uncomment the line above.
    var workItemType = row[27] ? row[27] : (level === 0 ? "Feature" : "Task"); 
    newRow.push(workItemType);
    
    // Titles
    for (var i = 0; i < 4; i++) {
      newRow.push(i === level ? row[1] : "");
    }

    // You may need to add or remove some of these below, remember these have to be in order of your column headers.
    // Set the values for direct transform
    newRow.push(row[14]); // Priority
    newRow.push(row[12]); // Assigned To
    newRow.push(row[2]); // Description
    newRow.push(row[3]); // State
    newRow.push(""); // Reason

    var dueDateText = row[7];
    var dueDate = parseDueDate(dueDateText);
    newRow.push(dueDate); // Due Date
    newRow.push(""); // Close Date

    // Add the tasks
    adoData.push(newRow);

    // Add subtasks
    task.subtasks.forEach((subtask) => {
      addTasks({ row: subtask, subtasks: [] }, level + 1);
    });
  }

  // We were unable to get the ClickUp date's to format properly so we ended up 
  // using the Text versions of the dates from the export. This is where this function comes in.
  // Function to parse due date text
  function parseDueDate(dueDateText) {
    if (!dueDateText) return "";
    var date = new Date(dueDateText);
    if (!isNaN(date.getTime())) {
      return Utilities.formatDate(date, Session.getScriptTimeZone(), "MM/dd/yyyy");
    }
    return "";
  }

  // Process each parent task and its subtasks
  parentTasks.forEach((row) => {
    if (row[3].toLowerCase() !== "closed") { // Check if parent task status is not closed
      var taskId = row[0];
      addTasks(taskMap[taskId], 0);
    }
  });

  // Write to ADO_Import sheet
  adoImportSheet.clear();
  adoImportSheet.getRange(1, 1, adoData.length, adoData[0].length).setValues(adoData);
}
