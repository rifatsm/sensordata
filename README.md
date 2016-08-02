# sensordata (Notes for research team)

Data aggregation and visualisation scripts. Sensordata (not included) are required to run these scripts.

---

## Aggregation scripts

### Workflow
1. `git clone https://github.com/ayaankazerouni/sensordata.git`
2. `cd sensordata`
3. `./clean.py <sensordata file> <output file>` To clean messed up assignment names, add some columns for visualisation, etc.
4. `./aggregate.sh <output file from previous step>` This will generate subsessions, worksessions, time spent, and launch stats for each project.

### clean.py
Cleans the data by doing the following:
* Adds a column called `cleaned_assignment` containing the best guess for the assignment that event
  belongs to. The value in this column will be in the format: `Assignment 1|2|3|4`
* Adds a column `clean?`. Value is 1 if the script is sure of the value in `cleaned_assignment`,
  0 otherwise.
* Sensordata currently stores `LaunchType` and `TerminationType` data nonsensically. This script
  moves `LaunchType` and `TerminationType` data into the `Subtype` column, eliminating the
  need for two extra columns with several null values in each.

### subsessions.py
* Usage: `./subsessions.py <input file> <output file>`
* Pass the script **_cleaned_** data as input. It will squash events into subsessions containing data
  about editing activity (statements added, methods added) during the subsession. A subsession is
  defined as:
> Programming activities leading up to a launch event or the end of the current work session.

### work_sessions.py
* Usage: `./work_sessions.py <input file> <output file>`
* Pass the script the output from `subsessions.py`. It will extract work sessions from the input,
  containing data about editing activity (statements added, methods added) and the number of launches
  during the work session. Behaviour in a testing or regular context are identified as such. It will
  also extra the start time and end time of the work sessions.
* Work sessions are (currently) defined as:
> A period of activity that is separated from other periods of activity by a gap of 3 hours or more
without activity.

### time_spent.py
* Pass in the output from work_sessions.py. Gets the time spent on each project for each student.

### launch_stats.py
* `./launch_stats.py quartiles <input file> <output file>` will get you quartiles for
  edits-per-launch in each project. Pass this script a **_subsession_** file.
* `./launch_stats.py totals <input file> <output file>` will get you totals for the launches in a
  project, for test launches and regular launches.

### duplicated.py
Gets you the projectIds and userIds for projects that have been duplicated in the original data file.
* `./duplicated.py raw <input file> <output file>` tries to get you the duplicates from raw data
  (clean or unclean, doesn't matter). **THIS MAY NOT GET YOU ALL DUPLICATES**
* `./duplicated.py time <input file> <output file>` gets you duplicates by looking at the file
  generated by `time_spent.py`. I can't feasibly go through the entire sensordata file to check if
  this is giving me all duplicates, but I think it is fairly trustworthy.

### misc.py
Miscellaneous functions.
* `./misc.py dist <data file> <column name> [limit]` Gets you all distinct values for a column.
* `./misc.py sample <data file> <column name> <vals,> <output file>` Gets you all rows where the given
  column has one of the given values. Not terribly useful unless you want a small subset of the data
  (like all events for a student, or a student's project, or Assignment 1) For more complex querying,
  import the csv file into a SQL client. For MySQL, use the [LOAD DATA INFILE
  command](http://dev.mysql.com/doc/refman/5.7/en/load-data.html).
* `./misc.py headers <csv file name>` Prints out the first row of the specified file.

---

## Tentative D3 visualisations

### Area chart showing programming in a work session:
* ~~Area chart with a student's code-editing activity on a project.~~
* ~~Reflect regular code editing activity as separate from test code editing activity.~~
* ~~Reflect launching activity during programming.~~
* Tooltips for more detailed data for a point in time.
* Bring areas to front when you hover over them.
* Reflect Web-CAT reference tests passed over time.

### Visualisation for programming in a subsession:
* Display launching activity as events interspersed in programming activity, rather than as aggregate
data.

Virginia Tech 2016
