# Metro Guru 2: Electric Boogaloo
Michael Marshall
heymikemarshall@gmail.com

---
## Prologue: We're gonna need a bigger boat

This project was born of a previous project, Metro Guru. Metro Guru focused on the visualization of realtime data collected from the Washington Metropolitan Area Transit Authority API. That project relied on just-in-time API calls for data collection, but utilized a NoSQL database (MongoDB) to store data from API calls that were not likely to change. It was able to map up-to-the-minute geographic locations of every active MetroBus within the D.C. metropolitan area.

But this lead to the question of whether I'd be able to build a data capture solution that would allow for an analysis of trends within the WMATA bus system. The live bus position api end point can return more than 900 records of bus positions during peak hours, and the WMATA API documentation states that these bus positions can update once every 7 to 10 seconds. For the purpose of this project, I set a goal to capture 7 days of continuous data. To estimate the requirements for the data caputre, I used approximate peak record volume and padded upwards, with API calls being made every 10 seconds. Doing the math, I needed to prepare a solution that had the potential of capturing **tens of millions** of records, and **hundreds of millions** of data points, with a budget of effectively zero dollars. So I asked myself, what do I have laying around the house?
 





---
## Chapter 1: Building The RPi API Recorder


In order to capture the data we will need for this project (and there will be a lot of it) we will need to set up a "server" to record the results of API calls to the WMATA end-point. While this would be significantly easier to do with a cloud service such as AWS, my intitial estimates for the resulting size of the database put us in the area of needing a fairly expensive AWS EC2 instance. In the interest of trying to keep this project as-close-to-zero-as-possible, I had to explore other options. I had a number of Raspberry Pi 3 B's in a crate in my closet, and I felt that it could be feasible to set one up as a MongoDB server that could run the API recorder script and capture the data from WMATA. This proved to be somewhat of a challenge in and of itself. A variety of configurations were attempted, including one involving the install of an Ubuntu Server GUI. However, I found that the GUI took far too much of the years-old $35 computer (baseline RAM utilization over 60%). I had to settle for a completely CLI-based solution.


---
### Part 1: SD Card Prep and OS Install

#### Mac OS X, Disk Utility

1. Format SD card, MS-DOS (FAT)/ Master Boot Record

#### Mac OS X, Terminal

2. `$diskutil list`
    - get SD card disk name (e.g. /dev/disk2)
3. `$diskutil unmountDisk /dev/disk2`
    - unmount the target SD card
4. `$sudo dd bs=1m if={image path}.img of=/dev/disk2 conv=sync`
    - copy ubuntu boot image to SD card
5. Eject SD card

#### Ubuntu CLI

6. Insert SD card into RPi and boot
7. Log in to Ubuntu locally for OS initialization.  
    + Username: ubuntu  
    + Password: ubuntu
    
    At this point you are prompted to set the admin password. Once the password is set, you are logged into to the OS as user 'ubuntu'.

---
### Part 2: Networking and System Updates

At this point I ran into a *real fun problem*. I live in an apartment building that is only a few years old, and was pre-wired for Verizon Fios. While gigabit internet is a pretty amazing thing, the design of my apartment is such that the router is located in a telecom box in the hallway closet. When Ubuntu installs, it lacks the modules necessary to properly enable wifi. Since my wife would have had a fit if I were to run cabling through the hallway to the Fios router, I needed to hardwire into my network at least temporarily, but lacked the ability to do so directly. It took an hour or so of cajoling my desktop PC to serve as a temporary wifi bridge, but ultimately I was able to get it connected. Once connected to the internet I was able to apt-get the wifi modules.

#### Ubuntu CLI
1. `$sudo apt install wireless-tools`

@TODO:: ADD WIRELESS SETUP STEPS


and since we're in here, we might as well go ahead and make sure we're up-to-date on things.

2. `$sudo apt full-upgrade`

3. Give it a few minutes while it downloads packages, eventually it will prompt you for keyboard localization. 

3. Take five, smoke 'em if you got 'em.

4. `$sudo reboot`

5. After reboot, note the RPi's IP address.

Once networked via our method of choice, I was able to ditch being directly logged into the RPi, and start using SSH from OS X Terminal.

---
### Part 3: Install & Configure MongoDB



---
### Part 4: Install/Configure Python & Environment



---
### Part 5: Run Some Tests

---
### Part 6: Let's light this candle!