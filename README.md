## Overview

**General Goal:** Predict stability and articulate how services are being used now.

**Specific Goal:** Develop a system that can solve process problems now and grow into something that articulates impact, as those process problems are solved.

**Features:**
- Resource Management: Sign info linking up with services used 
- Notification System: Notifying someone when someone signs in.
- Trend Analysis: Use of services and their effect on stability goals.

## Users:
### Admin
**What Do They Want?**
- Add services
- Checkout trends
- Write Grants

### Donor
**What Do They Want?**
- Like to see impact

### Manager
**What Do They Want?**
- Manage Resources
- Easily contact guests

### Volunteers
**What Do They Want?**
- Know what they are doing (no ad hoc shower or notification system)

### Guest
**What Do They Want?**
- Use services quickly
- Know when packages or resources are ready.

### Use Cases
**Showers:**
1. Admin adds 10 showers service as a resource that can be booked by guests
2. Volunteers checking guests at entrance for showers, and let them know what place they are in line
3. Managers call guests and kick out people from showers when their 20 min is up.
4. Admins review the impact of showers: what guests are using showers, how often, and how does this lead to stability?
5. Donors donate when they see the showers lead to stability.

**Packages:**
- Admin creates "package" notification type.
- A package shows up for guests.
- Managers create a package notification for the guest. (By creating a package notification, they are linking the package to the guest and adding a time. Details of where the package is can be added into the message.)
- When guest signs in, volunteer/manager alerts them there is a package by reading their notificaiton.
- When package is picked up, volunteer/manager archives the notification. (By archiving the notification, it's set as picked up.)
- Admin reviews the trends around packages - seeing what users received more notifications that others, etc.

**Donors**
- Donor views HTC impact report and gets excited to see detailed data around how folks reached stability.

## Roles
- @bbertucc PM: Delivering Amazing by Friday.
- @BaronWolfenstein Data Vis: Creating a trend analysis with future data to inspire continue use of the app.
- @ebertucc Full Stack Dev: Building the from the DB structuring to the frontend.
- @mikesamm and Ian Painter: UX dev.

## Technical Specs
Data Structure (DRAFT):
- Guests
- Notifications
- Services
- Visits

## Deliverables
Wednesday, 1/22-
- @BaronWolfenstein: Generating some early sample data.
- @ebertucc: Stubbed out version of the stack.
- @mikesamm: Deeper input on showering.
- @bbertucc: UX sample.

## Additional Links
Information available here: https://philosophers.notion.site/htc-dashboard
