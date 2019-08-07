# Metro Guru 2: Electric Boogaloo
July 2019  
Michael Marshall  
heymikemarshall@gmail.com  

---
## Prologue: We're gonna need a bigger boat

This project was born of a previous project, Metro Guru. Metro Guru focused on the visualization of realtime data collected from the Washington Metropolitan Area Transit Authority API. That project relied on just-in-time API calls for data collection, but utilized a NoSQL database (MongoDB) to store data from API calls that were not likely to change. It was able to map up-to-the-minute geographic locations of every active MetroBus within the D.C. metropolitan area.

But this lead to the question of whether I'd be able to build a data capture solution that would allow for an analysis of trends within the WMATA bus system. The live bus position api end point can return more than 900 records of bus positions during peak hours, and the WMATA API documentation states that these bus positions can update once every 7 to 10 seconds. For the purpose of this project, I set a goal to capture 7 days of continuous data. To estimate the requirements for the data caputre, I used approximate peak record volume and padded upwards, with API calls being made every 10 seconds. Doing the math, I needed to prepare a solution that had the potential of capturing **tens of millions** of records, and **hundreds of millions** of data points, with a budget of effectively zero dollars. So I asked myself, "what do I have laying around the house?"
 



---
## Part I: Small Server, Big Data: Building The RPi API Recorder


In order to capture the data we will need for this project (and there will be a lot of it) we will need to set up a "server" to record the results of API calls to the WMATA end-point. While this would be significantly easier to do with a cloud service such as AWS, my intitial estimates for the resulting size of the database put us in the area of needing a fairly expensive AWS EC2 instance. In the interest of trying to keep this project as-close-to-zero-as-possible, I had to explore other options. I had a number of Raspberry Pi 3 B's in a crate in my closet, and I felt that it could be feasible to set one up as a MongoDB server that could run the API recorder script and capture the data from WMATA. This proved to be somewhat of a challenge in and of itself. A variety of configurations were attempted, including one involving the install of an Ubuntu Server GUI. However, I found that the GUI took far too much of the years-old $35 computer (baseline RAM utilization over 60%). I had to settle for a completely CLI-based solution.

---
### Chapter 0: Preparation

Before I got started I was going to need a few things. First, I needed a Micro SD card, luckily I had a 32GB card laying around not being used. Similarly I had a handfull of Raspberry Pi 3 B+'s collecting dust in my closet in "the box with all the cables and stuff" that every IT professional's significant other rolls their eyes at.

In the past, I've installed Ubuntu desktop on a few old laptops, and I've messed around with Raspberry Pi's a little bit, but I'm by no means whatsoever anything approaching an expert on either. Personally, I think I barely qualify as a hobbyist. But when something needs to be done, I'm thick headed enough to say "screw it, it can't be _that_ hard, can it?" and dive in head first.

Ubuntu's website is nice enough to host distros preconfigured for the RPi 2 and 3.  
https://ubuntu.com/download/iot/raspberry-pi-2-3

However, the installation instructions that are linked from that page ended up being a rabbit hole that required a few attempts before I began looking elsewhere for direction. Ultimately, what follows is the culmination of _hours_ of trial and error, all the Google-Fu I could muster, and occasionally throwing things against the wall to see what sticks.

This is more of the police report of what happened, rather than a bible on how to do this.




---
### Chapter 1: SD Card Prep and OS Install


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
### Chapter 2: Networking and System Updates

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
### Interlude: A Few Thoughts on Resource Management

>_Your scientists were so preoccupied with whether or not they could, they didn’t stop to think if they **should**._  
~_Ian Malcolm (Jurassic Park)_


The Raspberry Pi that I've started with here has a measely 1GB of onboard memory. So before even starting, this is my primary concern. One of the shiney new RPi 4B's with 4GB onboard memory would be far better suited to this task, and may well be a next step if the tests fail. I could probably go diving through thrift stores looking for discarded PC's as well, but I have a very small apartment and space is _definitely_ a thing.

My MacBook Pro has 8GB onboard, and seems to run the recorder script and MongoDB without any significant hits to memory consumption. Initially I had configured the script to update records as opposed to insert in order to avoid unneccesary duplicate records. However, while testing on my MacBook, as the database grew with each and every call to the WMATA API, the processing requirements for each succsessive call grew until the update command could not keep up with the pace of the API calls being made, which bottlenecked the process. To correct this bottlenecking, I implemented threading, and had the script perform a simple insert. I figure that storage is cheaper than processing, and it will be easier to account for duplicate records by doing some cleanup on the back end, rather than tring to avoid it outright with resource intesive upserts.

I'm hoping that this will be enough horsepower to handle a few thousand documents a minute. I guess in a worst case scenario I kinda wanted one of the new 4B models anyway. 

---
### Chapter 3: Install & Configure MongoDB


Create a swap, I'm not entirely sure about this, but it sounds like a good idea?

#### SSH Terminal
1. `$touch /tmp/theswap`  
2. `$chmod 600 /tmp/theswap`  
3. `$dd if=/dev/zero of=/tmp/theswap bs=1M count=2048`  
4. `mkswap /tmp/theswap`  
5. `sudo swapon /tmp/theswap`  
 
6. `$sudo nano /etc/mongodb.conf`  
To make MongoDB accessible from another computer, change bind IP to 0.0.0.0

7. `$service mongodb stop`
8. `$service mongodb start`

Connect from MongoDB Compass on MacBook? SUCCSSESS

Great, now STOP! It's time to back up the disk image.

Shut down the RPi, and remove the SD card. Putting the card back into the laptop. ID the disk and backup with the command:

#### Mac OS X Terminal
`sudo dd if=/dev/disk2 of=~/Desktop/raspberrypi.dmg` 

This bit takes a while as well. But at the end of the day, it takes less time than completely redoing all of the previous steps leading up to here if something goes wrong later.


---
### Chapter 4: Install/Configure Python & Environment

Here's the part where we start loading the Python environment we need to get things rolling.

`$ sudo apt install python3-pip`

`$ sudo apt install python3-venv`

---
### Chapter 5: Initial Testing and Resource Monitoring

After all of that, I'm probably 12 hours into this thing now. Blessedly, I can SSH to the server, and having set up the MongoDB service, I'm able to access the instance with MongoDB Compass on my MacBook. I think we're getting close. But with my concerns I'd mentioned earlier regarding the limited resources offered by the Raspberry Pi 3B, I knew that it was about to be run through its paces. I also wasn't particularly feeling like manually trying to monitor its progress over what would become a weeklong ordeal. Additionally, if the 3B wasn't going to meet the needs, I'd rather have been able to put the kibosh on this sooner rather than later so I could get back to the drawing board as quickly as possible.

So before bringing the API calls "in-house" to the RPi, it was easiest to run the script from VSCode on my laptop, and have the script write to the MongoDB on the RPi. After running for a few minutes, the RPi seemed to be handling the process surprisingly well, recording over 24,000 bus position records in only a few minutes.

But with that very first test out of the way, it was time to start getting the server warmed up.


---

## Part II: Release the ~~Hounds~~ ~~Kraken~~ API Calls!

### Chapter 0: Oh, right, the script!
I forgot to talk about the script! More or less it's a small excerpt from the Flask App I'd set up for Metro Guru 1. It's written in Python3, and only comes in at only about 63 lines of code. It captures data from two of WMATA's API endpoints. Every 10 seconds it collects geospacial information and metadata on every bus in the system currently in service. Additionally, every 60 seconds, a seperate end-point is called to return any and all active alerts and notifications. All returned documents are time-stamped by WMATA, though an additional client-side time stamp is added for every document, so each API call can individually be identified later. Think of that timestamp as a frame that holds each picture together as a snapshot of the MetroBus system at any given time. The additional time stamp will become crucial down the road, but for now, it's just another data point. The API call functions are made regularly every few seconds, and due to network latency or the possibility of the RPi taking longer to write documents to the Database than it takes to collect them, threading was implemented to allow for multiple instances of the functions to run in parallel and not slow down the pace of collection every 10 seconds.

---
### Chapter 1: At Your Service

At this point, I needed to get the script onto the RPi. My concept of this exercise involves the script collecting the API data into MongoDB every 10 seconds for a minimum of 168 consecutive hours. That in mind I needed to set the script to run as a service. Needing to not only continue running after logging out, but also capable of automatically restarting itself in the event of a critical failure or reboot. While these were not foreign concepts to me, configuring this to occur on a homebuilt Linux CLI server was a completely new excersize.

Ultimately, the solution I landed on was to make the Python script executable, write a small bash script monitor, and then add the monitor script to be a cronjob, set to start immediately at boot. None of that steps involved in doing this was known to me at the outset of this project. I tested the functionality of this by simply unplugging the RPi from power. Plugging it back in saw the service restored within only a few minutes.

---
### Chapter 2: The Long Wait and See.

At this point, having some automatic failure recovery baked in, the waiting game begins. At 10:30 pm on July 26th, I cleared the database and rebooted the server. Starting with more regular checks and then allowing the system to run overnight, I began logging the service's long-run performance statistics.

I ran progressively longer tests in succession. After running 1- and 12-hour tests, resource usage was found to be stable and the application appeared to run well. Having run the application for multiple-hour stints successfully, I began the first 7-day test. Between Saturday morning and Sunday night, the script collected just over 3 million records, which amounted to a bit over a gigabyte of data. The application appeared to be stable while running over multiple consecutive days, including morning and afternoon rush hours and by Wednesday I had collected over 15 million records. At this stage,it was apparent that I was collecting an immense amount of data, now I needed to figure out exactly what I was going to do with it all.

---

## Part III: Analytics and Visualizations

### Chapter 0: The OG Metro Guru

### Chapter 1: Start With One

### Chapter 2: Then, Do A Thousand

### Chapter 3: Bringing The Heat

### Chapter 4: Winners and Losers





