# MeetMinder

Live app: https://meetminder-reminder-app.vercel.app/

MeetMinder is a reminder app I built for the kind of things I usually write down and still forget later.

Sometimes I write meetings, interviews, tasks, or small plans in a notebook. The problem is not writing them down — the problem is remembering to check that notebook at the right time. I wanted one simple place where I could add something quickly and see what is coming up from my laptop, phone, or tablet.

That is why I built MeetMinder.

It is not meant to be a heavy productivity app. It is more like a small daily planner for normal life.

## Why I made this

I wanted an app that could help with simple but important reminders, like:

- an interview time
- a meeting link
- a task I need to finish today
- a class or work reminder
- a personal event
- something I would normally write in a notebook and forget to check

MeetMinder gives those things a proper place.

## What it does

With MeetMinder, I can:

- add a reminder with date and time
- save notes, location, meeting link, category, and priority
- see today’s schedule first
- check upcoming reminders
- edit a reminder when plans change
- delete a reminder
- undo delete if I remove something by mistake
- mark reminders as pending, done, missed, or rescheduled
- search and filter reminders
- open meeting links directly
- turn on browser reminders
- backup and restore reminder data

## How it works

The app uses Firebase Authentication for login and Firebase Firestore to save reminders.

After logging in, each user can only see their own reminders. The reminders stay saved, so refreshing the page does not remove them.

## Tech used

- React
- Vite
- Tailwind CSS
- Firebase Authentication
- Firebase Firestore
- Lucide React
- Browser Notification API
- Vercel

## Main parts of the app

### Login and signup

Users can create an account and log in. This keeps each person’s reminders separate.

### Reminder dashboard

The dashboard shows what is planned for today and what is coming next. I wanted the first view to be simple because most of the time I only need to know what I have today.

### Add and edit reminders

A reminder can include date, time, location, notes, category, priority, and meeting link.

### Delete with undo

If a reminder is deleted by mistake, the app gives an undo option instead of removing it without a chance.

### Search and filters

Reminders can be searched or filtered by date, category, priority, and status.

### Backup and restore

I added backup and restore because I wanted an extra safety option for saved reminders.

## Project setup

Clone the repository:

```bash
git clone https://github.com/ManaliRathod9/meetminder-reminder-app.git
