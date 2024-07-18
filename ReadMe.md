# ClickUp to Azure DevOps Transformation Script

This Google Apps Script transforms ClickUp tasks and subtasks from a Google Sheet into a format suitable for import into Azure DevOps (ADO). The script handles hierarchical task relationships, custom field mappings, and specific data filtering requirements.

## Features

- **Hierarchical Task Handling**: Converts ClickUp tasks and subtasks into ADO features and tasks.
- **Custom Field Mappings**: Maps specific fields from ClickUp to ADO, including custom handling for priority and due dates.
- **Data Filtering**: Processes only tasks from a specified project list and excludes closed parent tasks.
- **Date Parsing**: Converts due date text into a proper date format.

## Requirements

- Google Sheets with the following sheets:
  - `Raw`: Contains the exported ClickUp tasks.
  - `ADO_Import`: The target sheet for the transformed data.

## Sheet Structure

### Raw Sheet Columns (Starting at A)

1. Task Id
2. Task Name
3. Task Content
4. Status
5. Date Created
6. Date Created Text
7. Due Date
8. Due Date Text
9. Start Date
10. Start Date Text
11. Parent Id
12. Attachments
13. Assignees
14. Tags
15. Priority
16. List Name
17. Folder Name
18. Space Name
19. Time Estimate
20. Time Estimate Text
21. Checklists
22. Comments
23. Assigned Comments
24. Time Spent
25. Time Spent Text
26. Rolled Up Time
27. Rolled Up Time Text
28. Work Item Type -- This was an added column to allow us to "override" what the Work Item Type was going to be in ADO_Import sheet.

### ADO_Import Sheet Columns (Starting at A)

1. ID
2. Work Item Type
3. Title 1
4. Title 2
5. Title 3
6. Title 4
7. Priority
8. Assigned To
9. Description
10. State
11. Reason
12. Target Date
13. Closed Date

## Usage

1. **Open Google Sheets**: Open the Google Sheets document containing the `Raw` and `ADO_Import` sheets.
2. **Open Script Editor**: Go to `Extensions` > `Apps Script`.
3. **Copy and Paste the Script**: Replace any existing code with the script provided below.
4. **Save the Script**: Save the script.
5. **Run the Script**: Select the `transformData` function and run it.


