var vaseCreatorSketch = function( v ) {
  var state = "base"; //Determines if the view and GUI is in axonometric or overhead mode

  var bgColor = '#FF7C7B';
  var steelColor = '#B4D0DE'; 



//var holdTextBoxWidth = 350;
//var holdTextBoxHeight = 200;
//var holdTextBoxTextSize = 20;



  // Universal GUI vars
  var displayDens;
  var axisLabelSize;
  var sliderWidth = 200;
  var sliderHeight = 32;
  var guiMargins = 15;
  var guiInc = sliderHeight + guiMargins;
  var guiLabelSize = 15;
  var guiTextPadding = 4;
  var sliderStart = guiMargins + 100;
  var sliderEnd = guiMargins + sliderWidth - 5;
  var sliderTickPadding = 5;

  // GUI for base view
  let xSlider;
  let ySlider;
  let wiggleSlider;
  let lockButton;
  var xSliderY = guiMargins;
  var ySliderY = xSliderY + guiInc;
  var wiggleSliderY = ySliderY + guiInc;
  var lockButtonY = wiggleSliderY + guiInc;
  var axisToOffset;

  // GUI for axon view
  let goBackButton;
  let numRodsSlider;
  let maxHeightSlider;
  let purchaseButton;
  var goBackButtonY = guiMargins;
  var numRodsSliderY = goBackButtonY + guiInc;
  var maxHeightSliderY = numRodsSliderY + guiInc;
  var purchaseButtonY = maxHeightSliderY + guiInc;

  // GUI for final view
  let finalButton;
  var finalButtonY = goBackButtonY + guiInc;

  // Vars to determine base shape
  var perimeterPoints = [];
  var baseNoiseX = 0.0;
  var baseNoiseXInc = .01; // How squiggly is the shape
  var baseNoiseY = 0.0;
  var baseNoiseYInc = .002; // How quickly does the shape change

  // Vars to determine axon view elements
  var rods = [];
  var rodNoiseInc = .01;
  var maxSpeed = .15;
  var maxForce = 0.03;
  var scaledRodDiameter;
  var axonOrigin;
  var minRodHeight;
  var axonAngle;
  var zeroOrigin = v.createVector(0, 0);
  var heightNoise = 0.0;
  var heightNoiseInc = 0.005;
  var largerRadius;
  var roughBaseArea;

  var scaleFactor = 20;
  
  var unlockedFlag = true;

  v.preload = () => {
  
  }

  function clickInteraction() {
    sliders();
    buttons();
  }

  function mouseMoveInteraction() {
    if (v.mouseIsPressed) {
      sliders();
    }
  }

  function touchMoveInteraction() {
    sliders();
  }

  v.setup = () => {
    //var baseCreatorWidth = $('.projectContent').width();
    //var baseCreatorHeight = baseCreatorWidth * .67;

    //if (baseCreatorHeight > window.windowHeight * .9) {
    //  baseCreatorHeight = window.windowHeight * .9;
    //}

    var vaseCanvas = v.createCanvas(v.windowWidth, v.windowHeight);
    vaseCanvas.parent('vase-creator-holder');

    vaseCanvas.mouseClicked(clickInteraction);
    vaseCanvas.mouseMoved(mouseMoveInteraction);
    vaseCanvas.touchMoved(touchMoveInteraction);
    //TODO: touch stuff
    //TODO: make lock button a darker grey whem mouse is pressed

    displayDens = v.displayDensity();
    if (displayDens > 1) {
      displayDens *= .7;
    }

    setupBaseUI();

    var scaleMargin = .9;
    var xScale = (v.width / (2*xSlider.maxVal)) * scaleMargin;
    var yScale = (v.height / (2*ySlider.maxVal)) * scaleMargin;

    //scaleFactor = xScale < yScale ? xScale : yScale;
    if (xScale < yScale) {
      scaleFactor = xScale;
      axisToOffset = 'y';
    }
    else {
      scaleFactor = yScale;
      axisToOffset = 'x';
    }

    v.textFont('Roboto'); 
    axisLabelSize = v.width/50;
    if (axisLabelSize < 12) {
      axisLabelSize = 12;
    }
    v.textSize(axisLabelSize);

    
  }


  function setupBaseUI() {
    sliderWidth = 200 * displayDens;
    sliderHeight = 32 * displayDens;
    guiMargins = 15 * displayDens;
    guiInc = sliderHeight + guiMargins;
    guiLabelSize = 15 * displayDens;
    guiTextPadding = 4 * displayDens;
    sliderStart = guiMargins + 100 * displayDens;
    sliderEnd = guiMargins + sliderWidth - 5 * displayDens;
    sliderTickPadding = 5 * displayDens;

    xSliderY = guiMargins;
    ySliderY = xSliderY + guiInc;
    wiggleSliderY = ySliderY + guiInc;
    lockButtonY = wiggleSliderY + guiInc;

    xSlider = createSlider("width", guiMargins, xSliderY, 6, 40);
    ySlider = createSlider("height", guiMargins, ySliderY, 6, 30);
    wiggleSlider = createSlider("wiggle", guiMargins, wiggleSliderY, v.sqrt(1000), v.sqrt(5)); 
    lockButton = createButton("lockBase", guiMargins, lockButtonY);
  }


  function generateBase() {
    var origin = {x: v.width/2, y: v.height/2};
    var numPoints = 30;
    var degInc = 360.0 / numPoints;

    var xRefRadius = xSlider.currentVal * scaleFactor;
    var yRefRadius = ySlider.currentVal * scaleFactor;
    baseNoiseX = 0.0;
    baseNoiseY += baseNoiseYInc;
    var smoothFactor = 20;
  
    for (var i = 0; i < numPoints; i++) {
      var deg = i * degInc;
      var radians = deg * v.PI / 180.0;

      // Because the basic shape we will be distorting is an ellipse, we need to find its radius
      // at any given angle
      var tempRefRadius = (xRefRadius * yRefRadius) / v.sqrt(xRefRadius * xRefRadius * v.sin(radians) * v.sin(radians) + yRefRadius * yRefRadius * v.cos(radians) * v.cos(radians));
      
      var tempMinRadius = tempRefRadius * .6;
      var radiusOffset = tempRefRadius - tempMinRadius;
      var tempRadius = tempMinRadius + radiusOffset * v.noise(deg * baseNoiseX / smoothFactor, baseNoiseY);
      baseNoiseX += 1 / (wiggleSlider.currentVal * wiggleSlider.currentVal);
    
      var xPos = tempRadius * v.cos(radians);
      var yPos = tempRadius * v.sin(radians);   
      perimeterPoints[i] = v.createVector(xPos, yPos);
    }

    perimeterPoints[numPoints] = perimeterPoints[0];
    perimeterPoints[numPoints + 1] = perimeterPoints[1];
    perimeterPoints[numPoints + 2] = perimeterPoints[2];
  }


  function drawBase() {
    v.push();
    v.translate(v.width/2, v.height/2);
    v.fill(steelColor);
    v.stroke(0);
    v.strokeWeight(1);
    v.beginShape();
    for (var i = 0; i < perimeterPoints.length; i++) {
        v.curveVertex(perimeterPoints[i].x, perimeterPoints[i].y);
    }  
    v.endShape();
    v.pop();
  }


  function drawBaseAxes() {
    var offset = scaleFactor;
    var arrowLen = scaleFactor * 1.5;

    v.push();
    v.translate(v.width/2, v.height/2);
    v.stroke(0);

    // Draw the x axis
    var xAxisStart = {x: -xSlider.currentVal * scaleFactor, y: ySlider.currentVal * scaleFactor};
    var xAxisEnd = {x: xSlider.currentVal * scaleFactor, y: ySlider.currentVal * scaleFactor};
    if (axisToOffset == 'x') {
      xAxisStart.y += offset;
      xAxisEnd.y += offset;
    }
    v.line(xAxisStart.x, xAxisStart.y, xAxisEnd.x, xAxisEnd.y);

    // Draw the x axis arrows
    v.line(xAxisStart.x, xAxisStart.y, xAxisStart.x + arrowLen, xAxisStart.y - arrowLen);
    v.line(xAxisStart.x, xAxisStart.y, xAxisStart.x + arrowLen, xAxisStart.y + arrowLen);
    v.line(xAxisEnd.x, xAxisEnd.y, xAxisEnd.x - arrowLen, xAxisEnd.y - arrowLen);
    v.line(xAxisEnd.x, xAxisEnd.y, xAxisEnd.x - arrowLen, xAxisEnd.y + arrowLen);


    // Draw the y axis
    var yAxisStart = {x: xSlider.currentVal * scaleFactor, y: -ySlider.currentVal * scaleFactor};
    var yAxisEnd = {x: xSlider.currentVal * scaleFactor, y: ySlider.currentVal * scaleFactor};
    if (axisToOffset == 'y') {
      yAxisStart.x += offset;
      yAxisEnd.x += offset;
    }
    v.line(yAxisStart.x, yAxisStart.y, yAxisEnd.x, yAxisEnd.y);

    // Draw the y axis arrows
    v.line(yAxisStart.x, yAxisStart.y, yAxisStart.x - arrowLen, yAxisStart.y + arrowLen);
    v.line(yAxisStart.x, yAxisStart.y, yAxisStart.x + arrowLen, yAxisStart.y + arrowLen);
    v.line(yAxisEnd.x, yAxisEnd.y, yAxisEnd.x - arrowLen, yAxisEnd.y - arrowLen);
    v.line(yAxisEnd.x, yAxisEnd.y, yAxisEnd.x + arrowLen, yAxisEnd.y - arrowLen);

    // Label axes
    v.noStroke();
    v.textSize(axisLabelSize);
    v.textAlign(v.CENTER);
    v.text(xSlider.currentVal.toFixed(1) + '\"', 0, xAxisEnd.y + axisLabelSize);
    v.textAlign(v.LEFT);
    v.text(ySlider.currentVal.toFixed(1) + '\"', xAxisEnd.x + axisLabelSize/8, axisLabelSize/2);

    v.pop();
  }


  v.draw = () => {
    if (state == "base") {
      v.background(bgColor);
      generateBase();
      drawBase();
      drawBaseAxes();
      drawBaseGui();
    }
    else if (state == "axon") {
      v.background(bgColor);
      //drawBase();
      updateRods();
      //drawRods();
      axonAngle = -v.PI/4;
      drawAxonBase();
      drawAxonRods();
      drawAxonAxis();
      drawAxonGui();
    }

    else if (state == "final") {
      v.background(bgColor);
      axonAngle += .005;
      drawAxonBase();
      drawAxonRods();
      drawAxonAxis();
      drawFinalGui();
    }
  }

  function updateRods() {
    for (var i = 0; i < rods.length; i++) {
      var tempRod = rods[i];
      
      var wan = wander(tempRod);
      wan.mult(.2); // The wander part of things was just being a little pushy
      tempRod.acc.add(wan);
      
      var edge = avoidEdge(tempRod);
      tempRod.acc.add(edge);
      
      var sep = separate(tempRod);
      tempRod.acc.add(sep);

      // Add vel
      tempRod.vel.add(tempRod.acc);
      tempRod.vel.limit(maxSpeed);
      tempRod.loc.add(tempRod.vel);
      //tempRod.loc.add(tempRod.vel);
    }
  }

  function wander(rod) {
    // Add random wander
    var steer = v.createVector(v.noise(rod.wanderNoise)-.48, v.noise(rod.wanderNoise+20)-.48);
    rod.wanderNoise += rodNoiseInc;

    //v.push();
    //v.translate(f.width/2, f.height/2);
    steer.normalize();
    steer.mult(scaleFactor);
    //v.strokeWeight(3);
    //v.stroke(255, 0, 0);
    //v.line(rod.loc.x, rod.loc.y, rod.loc.x + steer.x, rod.loc.y + steer.y);
    //v.pop();

    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(maxSpeed);
      steer.sub(rod.vel);
      steer.limit(maxForce);
    }
    return steer;
  }

  // Avoid shape edge 
  function avoidEdge(rod) {
    // Determine closest edge
    var closestEdge = [0,1];
    var closestDist = 10000000;
      
    // Determine which two points that make up the base the point is closest to
    for (var j = 0; j < perimeterPoints.length - 1; j++) {
      var p1Dist = v.dist(rod.loc.x, rod.loc.y, perimeterPoints[j].x, perimeterPoints[j].y);
      var p2Dist = v.dist(rod.loc.x, rod.loc.y, perimeterPoints[j+1].x, perimeterPoints[j+1].y);
      var totalDist = p1Dist + p2Dist;

      if (totalDist < closestDist) {
        closestEdge = [j, j+1];
        closestDist = totalDist;
      }
    }
    var p1 = {x: perimeterPoints[closestEdge[0]].x, y: perimeterPoints[closestEdge[0]].y};
    var p2 = {x: perimeterPoints[closestEdge[1]].x, y: perimeterPoints[closestEdge[1]].y}

    // How far away from the line made by those two points is the rod?
    var distToLine = distanceToLine(rod.loc.x, rod.loc.y, p1.x, p1.y, p2.x, p2.y);

    // Steer away from that line if it's less than a certain distance
    var steer = v.createVector(0, 0);
    var desiredMargin = scaleFactor * 4;
    if (distToLine < desiredMargin) {
      var diff = v.createVector(p1.y - p2.y, -(p1.x - p2.x));
      diff.normalize();
      diff.div(distToLine);
      steer.add(diff);
    }

    // Show it
    /*
    if (distToLine < desiredMargin) {
      f.push();
      f.translate(f.width/2, f.height/2);
      //console.log(closestEdge);
      f.strokeWeight(3);
      f.stroke(0, 255, 0);
      var normalVector = f.createVector(p1.y - p2.y, -(p1.x - p2.x));
      f.line(rod.loc.x, rod.loc.y, rod.loc.x + normalVector.x, rod.loc.y + normalVector.y);
      f.line(p1.x, p1.y, p2.x, p2.y);
      f.strokeWeight(1);
      f.stroke(0);
      f.pop();
    }*/

    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(maxSpeed);
      steer.sub(rod.vel);
      steer.limit(maxForce);
    }
    return steer;
  }

  function distanceToLine(x0, y0, x1, y1, x2, y2) {
    //console.log(x0 + ', ' + y0 + ', ' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2);
    return (v.abs((x2-x1)*(y1-y0) - (x1-x0)*(y2-y1))) / (v.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)));
  }

  function separate(rod) {
    // Minimum distance between two rods should be 2" - that's scaleFactor * 2 * 2
    // Increase that number a bit just to give us some room;
    var desiredSeparation = scaleFactor * 5;

    var steer = v.createVector(0, 0);
    var count = 0;

    //f.push();
    //f.translate(f.width/2, f.height/2);
    //f.strokeWeight(1);
    //f.stroke(0, 0, 255);

    // For every rod in the system, check if it's too close
    for (var i = 0; i < rods.length; i++) {
      var other = rods[i]
      var d = v.dist(rod.loc.x, rod.loc.y, other.loc.x, other.loc.y);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredSeparation)) {
        // Calculate vector pointing away from neighbor
        //v.line(rod.loc.x, rod.loc.y, other.loc.x, other.loc.y);
        var diff = p5.Vector.sub(rod.loc, other.loc);
        diff.normalize();
        diff.div(d);        // Weight by distance
        steer.add(diff);
        count++;            // Keep track of how many
      }
    }
    //f.pop();

    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(maxSpeed);
      steer.sub(rod.vel);
      steer.limit(maxForce);
    }
    return steer;
  }

  function createSlider(_name, _xPos, _yPos, _minVal, _maxVal) {
    var sliderRange = _maxVal - _minVal;
    var midVal = (_maxVal + _minVal)/2;
    //return {name: _name, xPos: _xPos, yPos: _yPos, minVal: _minVal, maxVal: _maxVal, currentVal: (_maxVal + _minVal)/2 };
    return {name: _name, 
            xPos: _xPos, 
            yPos: _yPos, 
            minVal: _minVal, 
            maxVal: _maxVal, 
            currentVal: midVal + v.random(-sliderRange / 4, sliderRange / 4) 
    };
  }

  function createButton(_name, _xPos, _yPos) {
    return {name: _name, xPos: _xPos, yPos: _yPos};
  }

  function drawBaseGui() {
    // Draw button/ slider rectangles
    v.stroke(0);
    v.fill(steelColor);
    v.rect(xSlider.xPos, xSlider.yPos, sliderWidth, sliderHeight);
    v.rect(ySlider.xPos, ySlider.yPos, sliderWidth, sliderHeight);
    v.rect(wiggleSlider.xPos, wiggleSlider.yPos, sliderWidth, sliderHeight);
    v.rect(lockButton.xPos, lockButton.yPos, sliderWidth, sliderHeight);

    // Label buttons/ sliders
    v.noStroke();
    v.fill(0);
    v.textSize(guiLabelSize);
    v.textAlign(v.LEFT);
    var textOffset = sliderHeight - (sliderHeight - guiLabelSize) / 2 - 2;
    v.text("Width:", guiMargins + guiTextPadding, xSliderY + textOffset);
    v.text("Height:", guiMargins + guiTextPadding, ySliderY + textOffset);
    v.text("Wiggliness:", guiMargins + guiTextPadding, wiggleSliderY + textOffset);
    v.text("Lock in shape", guiMargins + guiTextPadding, lockButton.yPos + textOffset);

    // Draw the sliders
    v.stroke(0);
    v.line(sliderStart, xSlider.yPos + sliderHeight/2, sliderEnd, xSlider.yPos + sliderHeight/2);
    v.line(sliderStart, ySlider.yPos + sliderHeight/2, sliderEnd, ySlider.yPos + sliderHeight/2);
    v.line(sliderStart, wiggleSlider.yPos + sliderHeight/2, sliderEnd, wiggleSlider.yPos + sliderHeight/2);

    v.strokeWeight(3);

    var xSliderTickPos = v.map(xSlider.currentVal, xSlider.minVal, xSlider.maxVal, sliderStart, sliderEnd);
    v.line(xSliderTickPos, xSliderY + sliderTickPadding, xSliderTickPos, xSliderY + sliderHeight - sliderTickPadding);
    var ySliderTickPos = v.map(ySlider.currentVal, ySlider.minVal, ySlider.maxVal, sliderStart, sliderEnd);
    v.line(ySliderTickPos, ySliderY + sliderTickPadding, ySliderTickPos, ySliderY + sliderHeight - sliderTickPadding);
    var wiggleSliderTickPos = v.map(wiggleSlider.currentVal, wiggleSlider.minVal, wiggleSlider.maxVal, sliderStart, sliderEnd);
    v.line(wiggleSliderTickPos, wiggleSliderY + sliderTickPadding, wiggleSliderTickPos, wiggleSliderY + sliderHeight - sliderTickPadding);

    v.strokeWeight(1);
  }

  function drawAxonGui() {
    // Draw button/ slider rectangles
    v.stroke(0);
    v.strokeWeight(1);
    v.fill(steelColor);
    v.rect(goBackButton.xPos, goBackButton.yPos, sliderWidth, sliderHeight);
    v.rect(numRodsSlider.xPos, numRodsSlider.yPos, sliderWidth, sliderHeight);
    v.rect(maxHeightSlider.xPos, maxHeightSlider.yPos, sliderWidth, sliderHeight);
    v.rect(purchaseButton.xPos, purchaseButton.yPos, sliderWidth, sliderHeight);

    // Label buttons/ sliders
    v.noStroke();
    v.fill(0);
    v.textSize(guiLabelSize);
    v.textAlign(v.LEFT);
    var textOffset = sliderHeight - (sliderHeight - guiLabelSize) / 2 - 2;
    v.text("Edit base shape", goBackButton.xPos + guiTextPadding + 1, goBackButton.yPos + textOffset);
    v.text("# of elements:", numRodsSlider.xPos + guiTextPadding + 1, numRodsSlider.yPos + textOffset);
    v.text("Max height:", guiMargins + guiTextPadding, maxHeightSlider.yPos + textOffset);
    v.text("Purchase: $" + totalCost.toFixed(2), guiMargins + guiTextPadding, purchaseButton.yPos + textOffset);

    // Draw the sliders
    v.stroke(0);
    v.line(sliderStart, numRodsSlider.yPos + sliderHeight/2, sliderEnd, numRodsSlider.yPos + sliderHeight/2);
    v.line(sliderStart, maxHeightSlider.yPos + sliderHeight/2, sliderEnd, maxHeightSlider.yPos + sliderHeight/2);
  
    v.strokeWeight(3);
    var numRodsSliderTickPos = v.map(numRodsSlider.currentVal, numRodsSlider.minVal, numRodsSlider.maxVal, sliderStart, sliderEnd);
    v.line(numRodsSliderTickPos, numRodsSlider.yPos + sliderTickPadding, numRodsSliderTickPos, numRodsSlider.yPos + sliderHeight - sliderTickPadding);
    var maxHeightSliderTickPos = v.map(maxHeightSlider.currentVal, maxHeightSlider.minVal, maxHeightSlider.maxVal, sliderStart, sliderEnd);
    v.line(maxHeightSliderTickPos, maxHeightSliderY + sliderTickPadding, maxHeightSliderTickPos, maxHeightSliderY + sliderHeight - sliderTickPadding);
  }



  function sliders() {
    if (state == "base") {
      if (v.mouseX >= sliderStart && v.mouseX <= sliderEnd) {

        // xSlider
        if (v.mouseY >= xSlider.yPos && v.mouseY <= xSlider.yPos + sliderHeight) {
          xSlider.currentVal = v.map(v.mouseX, sliderStart, sliderEnd, xSlider.minVal, xSlider.maxVal);
        }

        // ySlider
        if (v.mouseY >= ySlider.yPos && v.mouseY <= ySlider.yPos + sliderHeight) {
          ySlider.currentVal = v.map(v.mouseX, sliderStart, sliderEnd, ySlider.minVal, ySlider.maxVal);
        }

        // wiggleSlider
        if (v.mouseY >= wiggleSlider.yPos && v.mouseY <= wiggleSlider.yPos + sliderHeight) {
          wiggleSlider.currentVal = v.map(v.mouseX, sliderStart, sliderEnd, wiggleSlider.minVal, wiggleSlider.maxVal);
        }
      }
    }

    else if (state == "axon") {
      if (v.mouseX >= sliderStart && v.mouseX <= sliderEnd) {

        // numRodsSlider
        if (v.mouseY >= numRodsSlider.yPos && v.mouseY <= numRodsSlider.yPos + sliderHeight) {
          numRodsSlider.currentVal = Math.round(v.map(v.mouseX, sliderStart, sliderEnd, numRodsSlider.minVal, numRodsSlider.maxVal));
          generateRods(numRodsSlider.currentVal);
        }

        // maxHeightSlider
        if (v.mouseY >= maxHeightSlider.yPos && v.mouseY <= maxHeightSlider.yPos + sliderHeight) {
          maxHeightSlider.currentVal = v.map(v.mouseX, sliderStart, sliderEnd, maxHeightSlider.minVal, maxHeightSlider.maxVal);
        }
      }
    }
  }

  function buttons() {
    if (state == "base") {
      if (v.mouseX >= guiMargins && v.mouseX <= guiMargins + sliderWidth) {

        // Lock in shape button
        if (v.mouseY >= lockButton.yPos && v.mouseY <= lockButton.yPos + sliderHeight) {
          state = "axon";
          setupAxonView();
          generateRods(numRodsSlider.currentVal);
          largerRadius = xSlider.currentVal > ySlider.currentVal ? xSlider.currentVal * scaleFactor : ySlider.currentVal * scaleFactor;
        }
      }
    }

    
    else if (state == "axon") {
      if (v.mouseX >= guiMargins && v.mouseX <= guiMargins + sliderWidth) {

        // Go back to base editor button
        if (v.mouseY >= goBackButton.yPos && v.mouseY <= goBackButton.yPos + sliderHeight) {
          state = "base";
        }

        // Purchase button
        if (v.mouseY >= purchaseButton.yPos && v.mouseY <= purchaseButton.yPos + sliderHeight) {
          state = "final";
          finalButtonY = goBackButtonY + guiInc;
          finalButton = createButton("Confirm", guiMargins, finalButtonY);
        }
      }
    }

    else if (state == "final") {
      if (v.mouseX >= guiMargins && v.mouseX <= guiMargins + sliderWidth) {
        
        // Go back to axon editor button
        if (v.mouseY >= goBackButton.yPos && v.mouseY <= goBackButton.yPos + sliderHeight) {
          state = "axon";
        }

        // Confirm purchase button
        if (v.mouseY >= finalButton.yPos && v.mouseY <= finalButton.yPos + sliderHeight) {
          //state = "final";
          alert("not 4 sale right now ;)");
        }
      }
    }
  }

  function setupAxonView() {
    let unscaledRodDiameter = .375;
    scaledRodDiameter = Math.round(unscaledRodDiameter * 2 * scaleFactor);
    if (scaledRodDiameter % 2 != 0) {
      scaledRodDiameter += 1;
    }
    roughBaseArea = xSlider.currentVal * ySlider.currentVal * v.PI;
    var maxRods = Math.floor(roughBaseArea / 55);

    goBackButtonY = guiMargins;
    numRodsSliderY = goBackButtonY + guiInc;
    maxHeightSliderY = numRodsSliderY + guiInc;
    purchaseButtonY = maxHeightSliderY + guiInc;

    goBackButton = createButton("Edit base shape", guiMargins, goBackButtonY);
    numRodsSlider = createSlider("# of elements:", guiMargins, numRodsSliderY, 3, maxRods);
    maxHeightSlider = createSlider("maxHeight", guiMargins, maxHeightSliderY, scaledRodDiameter * 20, scaledRodDiameter * 50);
    purchaseButton = createButton("purchase", guiMargins, purchaseButtonY);

    axonOrigin = {x: v.width/2, y: v.height * .63};

    minRodHeight = scaledRodDiameter * 4;
  }

  function generateRods(numRods) {
    rods = [];
    for (var i = 0; i < numRods; i++) {
      rods[i] = createRod();
    }
  }

  function createRod() {
    return {loc: v.createVector(v.random(-40, 40), v.random(-40, 40)), 
            vel: v.createVector(v.random(-.2,.2), v.random(-.2,.2)),
            acc: v.createVector(0, 0),
            wanderNoise: v.random(100),
            heightNoiseSeed: v.random(50)};
  }

  function drawRods() {
    v.push();
    v.stroke(0);
    v.strokeWeight(1);
    v.fill(steelColor);
    v.translate(v.width/2, v.height/2);
    for (var i = 0; i < rods.length; i++) {
      var tempRod = rods[i];
      v.ellipse(tempRod.loc.x, tempRod.loc.y, scaledRodDiameter, scaledRodDiameter);
    }
    v.pop();
  }

  function drawAxonBase() {
    var baseThickness = scaledRodDiameter / 3;
    var baseOffsetX = baseThickness * v.sin(axonAngle); 
    var baseOffsetY = baseThickness * v.cos(axonAngle);
    v.push();
    v.translate(axonOrigin.x, axonOrigin.y);
    v.rotate(axonAngle);
    v.fill(steelColor);
    v.stroke(0);
    v.strokeWeight(1);

    v.beginShape();
    for (var i = 0; i < perimeterPoints.length; i++) {
      v.curveVertex(perimeterPoints[i].x + baseOffsetX, perimeterPoints[i].y + baseOffsetY);
    }  
    v.endShape();

    //a.translate(0, -baseThickness);

    v.beginShape();
    for (var i = 0; i < perimeterPoints.length; i++) {
      v.curveVertex(perimeterPoints[i].x, perimeterPoints[i].y);
    }  
    v.endShape();

    v.pop();
  }

  function drawAxonRods() {
    var translatedRods = [];

    if (state == "axon") {
      heightNoise += heightNoiseInc;
    }
    
    for (var i = 0; i < rods.length; i++) {
      var tempRod = rods[i];
      var rotatedPoint = rotatePoint(tempRod.loc, zeroOrigin, axonAngle);
      //var rHeight = maxRodHeight - a.dist(tempRod.loc.x, tempRod.loc.y, 0, 0);

      var localMaxHeight = v.map(v.dist(tempRod.loc.x, tempRod.loc.y, 0, 0), 0, largerRadius, maxHeightSlider.currentVal, minRodHeight);
      var localMinHeight = localMaxHeight * .6;
      if (localMinHeight < scaledRodDiameter * 3) {
        localMinHeight = scaledRodDiameter * 3;
      }
      var rHeight = v.map(v.noise(tempRod.heightNoiseSeed + heightNoise), 0, 1, localMinHeight, localMaxHeight);
      translatedRods[i] = {loc:v.createVector(rotatedPoint.x + axonOrigin.x, rotatedPoint.y + axonOrigin.y),
                           rodHeight: rHeight};
    }

    

    //This function is so that the rods closest to us are drawn first 
    translatedRods.sort(rodSorter);

    v.strokeWeight(1);
    v.fill(steelColor);
    
    for (var i = 0; i < translatedRods.length; i++) {
      var tempRod = translatedRods[i];
      var barrelAngle = v.atan2(tempRod.loc.y - axonOrigin.y, tempRod.loc.x - axonOrigin.x);
      if (barrelAngle > 0) { //atan2 returns values between PI and 2*PI as being -PI to 0
        drawRod(tempRod);
        drawBarrel(tempRod, barrelAngle);
      }
      else {
        drawBarrel(tempRod, barrelAngle);
        drawRod(tempRod);
      }
    }

    calcCost(translatedRods);
  }

  function rotatePoint(myPoint, center, angle) {
    var rotatedX = (myPoint.x - center.x)*v.cos(angle) - (myPoint.y - center.y)*v.sin(angle) + center.x;
    var rotatedY = (myPoint.x - center.x)*v.sin(angle) + (myPoint.y - center.y)*v.cos(angle) + center.y;
    return {x: rotatedX, y: rotatedY};
  }

  function rodSorter(a, b) {
    if (a.loc.y < b.loc.y) {
      return -1;
    }
    if (a.loc.y > b.loc.y) {
      return 1;
    }
    return 0;
  }

  function drawRod(rod) {
    v.noStroke();
    v.rect(rod.loc.x - scaledRodDiameter/2, rod.loc.y, scaledRodDiameter, -rod.rodHeight);
    v.stroke(0);
    v.arc(rod.loc.x + .5, rod.loc.y, scaledRodDiameter, scaledRodDiameter, 0, v.PI);
    v.line(rod.loc.x - scaledRodDiameter/2, rod.loc.y, rod.loc.x - scaledRodDiameter/2, rod.loc.y - rod.rodHeight);
    v.line(rod.loc.x + scaledRodDiameter/2, rod.loc.y, rod.loc.x + scaledRodDiameter/2, rod.loc.y - rod.rodHeight);
    v.ellipse(rod.loc.x + .5, rod.loc.y - rod.rodHeight, scaledRodDiameter, scaledRodDiameter);
  }

  function drawBarrel(rod, barrelAngle) {
    var barrelOuterWidth = scaledRodDiameter * 2.67;
    var barrelInnerWidth = scaledRodDiameter * 2.29;
    var wallThickness = (barrelOuterWidth - barrelInnerWidth) / 2;
    var barrelHeight = barrelOuterWidth;
    

    v.push();
    v.translate(rod.loc.x, rod.loc.y - rod.rodHeight);
    
    var topEllipseCenter = {x: (scaledRodDiameter/2 + barrelOuterWidth/2) * v.cos(barrelAngle),
                            y: (scaledRodDiameter/2 + barrelOuterWidth/2) * v.sin(barrelAngle) - barrelHeight/2};
    
    v.noStroke();
    v.rect(topEllipseCenter.x - barrelOuterWidth/2, topEllipseCenter.y, barrelOuterWidth, barrelHeight + 1);

    v.stroke(0);    
    v.line(topEllipseCenter.x - barrelOuterWidth/2, topEllipseCenter.y, topEllipseCenter.x - barrelOuterWidth/2, topEllipseCenter.y + barrelHeight);
    v.line(topEllipseCenter.x + barrelOuterWidth/2, topEllipseCenter.y, topEllipseCenter.x + barrelOuterWidth/2, topEllipseCenter.y + barrelHeight);
    v.ellipse(topEllipseCenter.x + .5, topEllipseCenter.y, barrelOuterWidth, barrelOuterWidth);
    v.ellipse(topEllipseCenter.x + .5, topEllipseCenter.y, barrelInnerWidth, barrelInnerWidth);
    v.arc(topEllipseCenter.x + .5, topEllipseCenter.y + barrelHeight, barrelOuterWidth, barrelOuterWidth, 0, v.PI);
    
    v.pop();
  }

  var totalCost = 0;
  function calcCost(translatedRods) {
    var baseCost = 60;
    var areaCost = roughBaseArea/40;
    var rodLaborCost = translatedRods.length * 10;
    var rodMaterialCost = 0;
    for (var i = 0; i < translatedRods.length; i++) {
      rodMaterialCost += translatedRods[i].rodHeight / 40;
    }
    totalCost = baseCost + areaCost + rodLaborCost + rodMaterialCost;
  }

  function drawAxonAxis() {
    v.push();
    v.translate(axonOrigin.x, axonOrigin.y);

    // Draw axis
    var arrowLen = scaleFactor * 1.5;
    var axisStart = {x: largerRadius, y: 0};
    var axisEnd = {x: largerRadius, y: -maxHeightSlider.currentVal};
    v.line(axisStart.x, axisStart.y, axisEnd.x, axisEnd.y);
    v.line(axisStart.x, axisStart.y, axisStart.x - arrowLen, axisStart.y - arrowLen);
    v.line(axisStart.x, axisStart.y, axisStart.x + arrowLen, axisStart.y - arrowLen);
    v.line(axisEnd.x, axisEnd.y, axisEnd.x - arrowLen, axisEnd.y + arrowLen);
    v.line(axisEnd.x, axisEnd.y, axisEnd.x + arrowLen, axisEnd.y + arrowLen);

    // Label axis
    v.noStroke();
    v.fill(0);
    v.textSize(axisLabelSize);
    v.text((maxHeightSlider.currentVal/(scaleFactor*2)).toFixed(1) + '\"', axisStart.x, axisStart.y - maxHeightSlider.currentVal/2);

    v.pop();
  }

  function drawFinalGui() {
    // Draw back button
    v.stroke(0);
    v.strokeWeight(1);
    v.fill(steelColor);
    v.rect(goBackButton.xPos, goBackButton.yPos, sliderWidth, sliderHeight);

    // Label back button
    v.noStroke();
    v.fill(0);
    v.textSize(guiLabelSize);
    v.textAlign(v.LEFT);
    var textOffset = sliderHeight - (sliderHeight - guiLabelSize) / 2 - 2;
    v.text("Edit rods", goBackButton.xPos + guiTextPadding + 1, goBackButton.yPos + textOffset);

    // Draw the confirm button
    v.stroke(0);
    v.fill(0);
    v.rect(finalButton.xPos, finalButton.yPos, sliderWidth, sliderHeight);
  
    v.noStroke();
    v.fill(255);
    v.text("Confirm purchase: $" + totalCost.toFixed(2), finalButton.xPos + guiTextPadding + 1, finalButton.yPos + textOffset);
  }

};

//var baseUnlockedFlag = true;
let vaseCreatorP5 = new p5(vaseCreatorSketch);