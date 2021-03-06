#! /usr/bin/env python3

"""Collapses subsessions into work sessions.

To use:
    ./work_sessions.py <subsessions file> <outfile>
"""

import csv
import sys

def get_work_sessions(infile, outfile):
    """Collapses subsession data from infile into work session data in outfile."""

    fieldnames = [
        'projectId',
        'userId',
        'email',
        'CASSIGNMENTNAME',
        'workSessionId',
        'start_time',
        'end_time',
        'normalLaunches',
        'testLaunches',
        'editSizeStmts',
        'testEditSizeStmts',
        'editSizeMethods',
        'testEditSizeMethods'
    ]

    prev_row = None
    ws = None
    test_launches = 0
    normal_launches = 0
    start_time = None
    edit_size_stmts = 0
    test_edit_size_stmts = 0
    edit_size_methods = 0
    test_edit_size_methods = 0
    green_zones = 0

    with open(infile, 'r') as fin, open(outfile, 'w') as fout:
        reader = csv.DictReader(fin, delimiter=',')
        writer = csv.DictWriter(fout, delimiter=',', fieldnames=fieldnames)

        # Write headers first.
        writer.writerow(dict((fn, fn) for fn in writer.fieldnames))

        for row in reader:
            prev_row = prev_row or row
            if (row['userId'] == prev_row['userId'] and row['CASSIGNMENTNAME'] == prev_row['CASSIGNMENTNAME'] \
                and row['workSessionId'] == prev_row['workSessionId']):
                    start_time = start_time or int(float(row['wsStartTime']))
                    edit_size_stmts += int(row['editSizeStmts'])
                    test_edit_size_stmts += int(row['testEditSizeStmts'])
                    edit_size_methods += int(row['editSizeMethods'])
                    test_edit_size_methods += int(row['testEditSizeMethods'])

                    if (repr(row['launchType']) == repr('Test')):
                        test_launches += 1
                    elif (repr(row['launchType']) == repr('Normal')):
                        normal_launches += 1

                    prev_row = row
            else:
                to_write = {
                    'userId': prev_row['userId'],
                    'email': prev_row['email'],
                    'projectId': prev_row['projectId'],
                    'CASSIGNMENTNAME': prev_row['CASSIGNMENTNAME'],
                    'workSessionId': prev_row['workSessionId'],
                    'start_time': start_time,
                    'end_time': int(float(prev_row['time'])),
                    'normalLaunches': normal_launches,
                    'testLaunches': test_launches,
                    'editSizeStmts': edit_size_stmts,
                    'testEditSizeStmts': test_edit_size_stmts,
                    'editSizeMethods': edit_size_methods,
                    'testEditSizeMethods': test_edit_size_methods
                }
                writer.writerow(to_write)

                edit_size_stmts = int(row['editSizeStmts'])
                test_edit_size_stmts = int(row['testEditSizeStmts'])
                edit_size_methods = int(row['editSizeMethods'])
                test_edit_size_methods = int(row['testEditSizeMethods'])
                start_time = int(float(row['wsStartTime']))
                if (repr(row['launchType']) == repr('Test')):
                    test_launches = 1
                    normal_launches = 0
                elif (repr(row['launchType']) == repr('Normal')):
                    normal_launches = 1
                    test_launches = 0
                else:
                    normal_launches = 0
                    test_launches = 0

                prev_row = row

        to_write = {
            'userId': prev_row['userId'],
            'projectId': prev_row['projectId'],
            'email': prev_row['email'],
            'CASSIGNMENTNAME': prev_row['CASSIGNMENTNAME'],
            'workSessionId': prev_row['workSessionId'],
            'start_time': start_time,
            'end_time': int(float(prev_row['time'])),
            'normalLaunches': normal_launches,
            'testLaunches': test_launches,
            'editSizeStmts': edit_size_stmts,
            'testEditSizeStmts': test_edit_size_stmts,
            'editSizeMethods': edit_size_methods,
            'testEditSizeMethods': test_edit_size_methods
        }
        writer.writerow(to_write)

def main(args):
    infile = args[0]
    outfile = args[1]
    try:
        get_work_sessions(infile, outfile)
    except FileNotFoundError as e:
        print("Error! File %s does not exist." % infile)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Collapses subsession data from infile into work session data in outfile.')
        print('Usage:\n\t./work_sessions.py <input_file> <output_file>')
        sys.exit()
    main(sys.argv[1:])
