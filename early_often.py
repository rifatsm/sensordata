#! /usr/bin/env python3

import sys
import csv
import datetime

def early_often_scores(infile, outfile, deadline):
    fieldnames = [
        'projectId',
        'userId',
        'cleaned_assignment',
        'earlyOftenIndex',
    ]

    due_date = datetime.date.fromtimestamp(deadline / 1000)

    with open(infile, 'r') as fin, open(outfile, 'w') as fout:
        reader = csv.DictReader(fin, delimiter=',')
        writer = csv.DictWriter(fout, delimiter=',', fieldnames=fieldnames)

        # Write headers first.
        writer.writerow(dict((fn, fn) for fn in writer.fieldnames))

        prev_row = None
        total_weighted_edit_size = 0
        total_edit_size = 0

        curr_sizes = {}

        for row in reader:
            prev_row = prev_row or row

            time = int(row['time'])
            date = datetime.date.fromtimestamp(time / 1000)
            days_to_deadline = (due_date - date).days

            if (row['userId'] == prev_row['userId'] and row['projectId'] == prev_row['projectId']):
                if (repr(row['Type']) == repr('Edit') and len(row['Class-Name']) > 0):
                    class_name = repr(row['Class-Name'])
                    curr_size = int(row['Current-Statements'])
                    prev_size = curr_sizes.get(class_name, 0)

                    edit_size = abs(prev_size - curr_size)
                    total_weighted_edit_size += (edit_size * days_to_deadline)
                    total_edit_size += + edit_size

                    curr_sizes[class_name] = curr_size
                prev_row = row
            else:
                if (total_edit_size > 0):
                    early_often_index = total_weighted_edit_size / total_edit_size
                    to_write = {
                        'projectId': prev_row['projectId'],
                        'userId': prev_row['userId'],
                        'cleaned_assignment': prev_row['cleaned_assignment'],
                        'earlyOftenIndex': early_often_index
                    }
                    writer.writerow(to_write)

                if (repr(row['Type']) == repr('Edit') and len(row['Class-Name']) > 0):
                    curr_sizes = {}

                    class_name = repr(row['Class-Name'])
                    curr_size = int(row['Current-Statements'])
                    prev_size = curr_sizes.get(class_name, 0)

                    edit_size = abs(prev_size - curr_size)
                    total_weighted_edit_size = (edit_size * days_to_deadline)
                    total_edit_size = edit_size

                prev_row = row

        if (total_edit_size > 0):
            early_often_index = total_weighted_edit_size / total_edit_size
            to_write = {
                'projectId': prev_row['projectId'],
                'userId': prev_row['userId'],
                'cleaned_assignment': prev_row['cleaned_assignment'],
                'earlyOftenIndex': early_often_index
            }
            writer.writerow(to_write)

def main(args):
    infile = args[0]
    outfile = args[1]
    deadline = args[2]
    try:
        early_often_scores(infile, outfile, deadline)
    except FileNotFoundError as e:
        print("Error! File '%s' does not exist." % infile)

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print('Calculates an early/often index for each student project for a given assignment.')
        print('Early/often is the [sum of (editSize * daysToDeadline) / totalEditSize].')
        print('Usage:\n\t./early_often.py <input file> <output file> <assignment deadline as a millisecond timestamp>')
        sys.exit()
    main(sys.argv[1:])