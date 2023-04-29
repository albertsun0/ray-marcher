Albert Sun, Nabil Chowdury
NOTE: We have both completed the eCIS survey.

Our project showcases a technique known as Ray Marching in order to generate three-dimensional scenes.
In our submission besides our code and our writeup we have also included a video artifact showcasing a few scenes we have generated using Ray Marching.

Our project is written in Typescript and we used the Menger Sponge boiler code as our starting point. 
As such you will have to ensure you have npm and the proper dependencies installed.

Installing Typescript:
npm install -g typescript
npm install -g http-server

In order to compile the code you will have to run the make-menger.py script from the project root folder.

After compiling the code you will have to launch the HTTP server using the following command:
http-server dist -c-1

Once you've started the server you can launch the app by going to http://127.0.0.1:8080 on your browser.

We have created a simple GUI that lets you flip through a set of scenes that we have created 
with instructions clearly labeling how to do so.