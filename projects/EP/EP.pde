PImage cover;
PImage PIS1, PIS2, PIS3, PIS4, PIS5, PIS6, PIS7, PIS8, PIS9, PIS10, PIS11;
PImage SAF1, SAF2, SAF3;
PImage TSF1, TSF2, TSF3, TSF4, TSF5, TSF6, TSF7, TSF8; 

PFont garamond;

int count=0;
int loadImg=0;

void setup()
{
  size(1280, 800);
  frameRate(30);
  garamond=loadFont("Garamond-Italic-15.vlw");
  textFont(garamond);
  background(255);
  loadPISFiles();
  smooth();
}

void draw()
{
  switch(count)
  {
  case 0: //create particle
    if (loadImg == 0)
    {
      for (int i = 0; i < allData.size(); i++)
      {
        Cluster temp = allData.get(i);
        temp.resetPoints();
      }
      background(255);
      //image(PIS5, 0, 0);
      loadImg++;
    }
    drawPISStage();
    break;

  case 1: //adjust thickness
    if (loadImg == 0)
    {
      for (int i = 0; i < allData.size(); i++)
      {
        Cluster temp = allData.get(i);
        temp.resetPoints();
      }
      background(255);
      //image(PIS6, 0, 0);
      loadImg++;
    }
    drawPISStage();
    break;


  case 2: //greyscale light
    if (loadImg == 0)
    {
      for (int i = 0; i < allData.size(); i++)
      {
        Cluster temp = allData.get(i);
        temp.resetPoints();
      }
      background(255);
      //image(PIS7, 0, 0);
      loadImg++;
    }
    drawPISStage();
    break;


  case 3: //x wander
    if (loadImg == 0)
    {
      for (int i = 0; i < allData.size(); i++)
      {
        Cluster temp = allData.get(i);
        temp.resetPoints();
      }
      background(255);
      //image(PIS8, 0, 0);
      loadImg++;
    }
    drawPISStage();
    break;


  case 4: //adjust opacity for temp
    if (loadImg == 0)
    {
      for (int i = 0; i < allData.size(); i++)
      {
        Cluster temp = allData.get(i);
        temp.resetPoints();
      }
      background(255);
      //image(PIS9, 0, 0);
      loadImg++;
    }
    drawPISStage();
    break;

  case 5: //y wander
    if (loadImg == 0)
    {
      for (int i = 0; i < allData.size(); i++)
      {
        Cluster temp = allData.get(i);
        temp.resetPoints();
      }
      background(255);
      //image(PIS10, 0, 0);
      loadImg++;
    }
    drawPISStage();
    break;
  }
}

void mouseClicked()
{
  count++;
  explainTime = 0;
  loadImg = 0;
}

boolean sketchFullScreen() {
  return true;
}

void drawPISStage()
{
  for (int i = 0; i < allData.size(); i++)
  {
    Cluster temp = allData.get(i);
    for (int j = 0; j < 6; j++)
    {
      temp.updatePoints();
      temp.drawPoints();
    }
  }
}

void keyPressed() {
  if (keyCode == LEFT) {
    count--;
    explainTime = 0; //interesting if you omit these
    loadImg = 0; //interesting if you omit these
  }
  if (keyCode == RIGHT) {
    count++;
    explainTime = 0;
    loadImg = 0;
  }
}

class Cluster
{
  ArrayList<Environment> data;
  float cTime = random(10);

  Cluster(ArrayList<Environment> data)
  {
    this.data = data;
  }

  void drawPoints()
  { 
    if (loadImg == 1)
    {
      //draw the timeline
      stroke(0);
      strokeWeight(.5);
      line(0, height/2, width, height/2);
      for (float i = 0; i <= 24; i++)
      {
        //draw ellipses
        noFill();
        stroke(0);
        strokeWeight(.5);
        ellipse((i/24)*width, height/2, 15, 15);

        //write numbers
        fill(0);
        noStroke();
        if (i < 10)
        {
          text("0" + ((int)i) + "h", (i/24)*width+12, height/2-12);
        }
        else
        {
          text(((int)i) + "h", (i/24)*width+12, height/2-12);
        }
      }
      loadImg++;
    }

    for (int i = 0; i < data.size(); i++)
    {
      Environment temp = data.get(i);
      if (count > 1) //adjust line color
      {
        stroke(temp.light*(255.0/1023.0));
        if (count > 3) //adjust line opacity
        {
          stroke((temp.light*(255.0/1023.0)), (temp.temp-15)*25.5);
        }
      }
      else
      {
        stroke(0);
      }

      if (count > 0) //adjust line thickness
      {
        strokeWeight(.5*(temp.space/1023.0));
      }
      if (i%10 == 0)
      {
        float x = temp.x % width;
        float prevX = temp.prevX % width;
        point(x, temp.y);
        line(x, temp.y, prevX, temp.prevY);
      }
    }
  }

  void updatePoints()
  {
    float aDiv = 100000; //Calibrate how much ambiance will affect the curve of the line
    for (int i = 0; i < data.size(); i++)
    {
      Environment temp = data.get(i);
      if (temp.working == 1)
      {
        temp.y -= temp.isWorking;
      }
      else
      {
        temp.y += temp.isWorking;
      }


      if (count > 4) //adjust y noise
      {
        temp.isWorking+=(noise(temp.ySeed)-.45)/100;
        temp.ySeed+=.07; //change this next
      }

      if (count > 2) //adjust x noise
      {
        temp.x+=(noise(temp.xSeed)-.49)*.5;
        temp.xSeed+=temp.ambiance/aDiv;
      }

      temp.prevX = temp.x;
      temp.prevY = temp.y;
      data.set(i, temp);
    }
  }

  void resetPoints()
  {
    for (int i = 0; i < data.size(); i++)
    {
      Environment temp = data.get(i);
      temp.y = height/2;
      temp.prevY = height/2;
      temp.x = temp.time/SECONDS_IN_DAY;
      temp.x *= width;
      temp.prevX = temp.x;
      data.set(i, temp);
    }
  }
}

float SECONDS_IN_DAY = 86400;

class Environment
{
  int MAX_DIFF = 75;
  
  float light;
  float temp;
  float ambiance;
  float working;
  float space;
  float time;
  float x, y;
  float xSeed;
  float ySeed;
  
  float prevX;
  float prevY;
  
  float isWorking = .1;
  
  Environment(float light, float temp, float ambiance, float working, float space, float time, float xSeed)
  {
    this.light = light;
    this.temp = temp;
    this.ambiance = ambiance; 
    this.working = working;
    this.space = space;
    this.time = time;
    this.xSeed = xSeed;
    ySeed = xSeed+5;
    x = y = prevY = prevX = height/2;
  }
  
  float lightDiff()
  {
    float diff = (light/1023)*MAX_DIFF;
    return diff;
  }
  
  float tempDiff()
  {
    float diff = (temp/30)*MAX_DIFF;
    return diff;
  }
  
  float getRadians()
  {
    float radians = (time/SECONDS_IN_DAY)*2*PI;
    return radians;
  }
  
}

ArrayList<Environment> FriNightStudio = new ArrayList<Environment>();
ArrayList<Environment> ThurMorning = new ArrayList<Environment>();
ArrayList<Environment> ThurNightHome = new ArrayList<Environment>();
ArrayList<Environment> ThurNightHome2 = new ArrayList<Environment>();
ArrayList<Environment> ThurNightStudio = new ArrayList<Environment>();
ArrayList<Environment> WedNightStudio = new ArrayList<Environment>();
ArrayList<Environment> WedNightStudio2 = new ArrayList<Environment>();

ArrayList<Cluster> allData = new ArrayList<Cluster>();

void loadPISFiles()
{
  //Friday night data
  getPISData("FriNightStudio.csv", FriNightStudio, 2029);
  float FriNightStudioEnd = convertToSec(20, 29); //Send to convertToSec in military time
  adjustTime(FriNightStudio, FriNightStudioEnd);
  Cluster FriNightStudioCluster = new Cluster(FriNightStudio);
  allData.add(FriNightStudioCluster);

  //Get Thursday morning data
  getPISData("ThurMorning.csv", ThurMorning, 1206);
  float ThurMorningEnd = convertToSec(12, 06); //Send to convertToSec in military time
  adjustTime(ThurMorning, ThurMorningEnd);
  Cluster ThurMorningCluster = new Cluster(ThurMorning);
  allData.add(ThurMorningCluster);

  //Get Thursday night home data
  getPISData("ThurNightHome.csv", ThurNightHome, 2157);
  float ThurNightHomeEnd = convertToSec(21, 57); //Send to convertToSec in military time
  adjustTime(ThurNightHome, ThurNightHomeEnd);
  Cluster ThurNightHomeCluster = new Cluster(ThurNightHome);
  allData.add(ThurNightHomeCluster);

  //Get Thursday night home 2 data
  getPISData("ThurNightHome2.csv", ThurNightHome2, 2358);
  float ThurNightHomeEnd2 = convertToSec(23, 58); //Send to convertToSec in military time
  adjustTime(ThurNightHome2, ThurNightHomeEnd2);
  Cluster ThurNightHome2Cluster = new Cluster(ThurNightHome2);
  allData.add(ThurNightHome2Cluster);

  //Get Thursday night studio data
  getPISData("ThurNightStudio.csv", ThurNightStudio, 2358);
  float ThurNightStudioEnd = convertToSec(23, 58); //Send to convertToSec in military time
  adjustTime(ThurNightStudio, ThurNightStudioEnd);
  Cluster ThurNightStudioCluster = new Cluster(ThurNightStudio);
  allData.add(ThurNightStudioCluster);

  //Get Wednesday night studio data
  getPISData("WedNightStudio.csv", WedNightStudio, 1855);
  float WedNightStudioEnd = convertToSec(18, 55); //Send to convertToSec in military time
  adjustTime(WedNightStudio, WedNightStudioEnd);
  Cluster WedNightStudioCluster = new Cluster(WedNightStudio);
  allData.add(WedNightStudioCluster);

  //Get Wednesday night studio 2 data
  getPISData("WedNightStudio2.csv", WedNightStudio2, 1855);
  float WedNightStudio2End = convertToSec(18, 55); //Send to convertToSec in military time
  adjustTime(WedNightStudio2, WedNightStudio2End);
  Cluster WedNightStudio2Cluster = new Cluster(WedNightStudio2);
  allData.add(WedNightStudio2Cluster);
}

void getPISData(String fileName, ArrayList<Environment> list, float xSeedStart)
{
  float xSeedStep = .01;
  String [] lines = loadStrings(fileName);
  for (String line : lines) {
    //float xSeedStart = random(10); interesting but wrong
    
    String[] pieces = split(line, ',');
    float light = float(pieces[0]);
    float temp = float(pieces[1]);
    float ambiance = float(pieces[2]);
    float working = float(pieces[3]);
    float space = float(pieces[4]);
    float time = float(pieces[5]);
    Environment data = new Environment(light, temp, ambiance, working, space, time, xSeedStart);
    list.add(data);
    xSeedStart+=xSeedStep;
    println(working);
  }
  println("Got your data son!");
}

float convertToSec(int hour, int min)
{
  hour*=(60*60); //Convert hours to seconds
  min*=60; //Convert mins to seconds
  return(hour+min);
}

void adjustTime(ArrayList<Environment> list, float endTime)
{
  float timeElapsed = list.get(list.size()-1).time; //Get the time ellapsed for the session
  println("End time is " + endTime);
  println("Time spent is " + timeElapsed);
  float beginTime = endTime - timeElapsed; //Calculate the time when data recording began

  for (int i = 0; i < list.size(); i++)
  {
    Environment temp = list.get(i);
    temp.time += beginTime;
    temp.x = temp.time/SECONDS_IN_DAY;
    temp.x *= width;
    list.set(i, temp);
    //println("Time for element " + i + " is " + temp.time + ". X is " + temp.x);
  }
}

int explainTime = 0;

void drawTime()
{
  int explainIndex = 14;

  if (explainTime == 0)
  {
    image(PIS4, 0, 0);
  }

  if (explainTime < width+explainIndex)
  {
    explainTime+=explainIndex;
    if (explainTime < width)
    {
      fill(255);
      noStroke();
      rect(0, (height/2)-50, width, (height/2)+50); //this creates clearer text
    }
    stroke(0);
    line(0, height/2, explainTime, height/2);
  }

  if (explainTime <= width+10) //+15
  {
    for (float i = 0; i <= 24; i++)
    {
      if (explainTime > 15+(i/24)*width || explainTime > width)
      {
        noFill();
        stroke(0);
        ellipse((i/24)*width, height/2, 15, 15);
        fill(0);
        if (i < 10)
        {
          text("0" + ((int)i) + "h", (i/24)*width+12, height/2-12);
        }
        else
        {
          text(((int)i) + "h", (i/24)*width+12, height/2-12);
        }
      }
    }
  }
}


