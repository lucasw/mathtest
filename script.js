/*
 Copyright Lucas Walter February 2014
 
 This file is part of mathtest.

 Foobar is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Foobar is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 
 */

var stage;
var numpad;
var num_entry_box;
var wd;
var ht;
var button_size;
var digit_display1;
var digit_display2;
var problem_area;
var problems;
// skip to next problem when current one is right
var auto_next = false;
// index into problems

var did_update = true;

// http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

// TODO make left and right arrows move the cur_ind of the num_entry_box
function handleKeyDown(e) {
  if (!e) { 
    console.log("tst");
    var e = window.event;
    if (!e) {
      console.log("no event");
      return false;
    }
  }
  
  if (!did_update) return;
 
  var key = String.fromCharCode( e.keyCode );
  //console.log("key " + key);

  var regex = /[0-9]|\./;
  if (regex.test(key)) {
    num = key.charCodeAt(0) - "0".charCodeAt(0);
    //console.log("key code " + num );
    num_entry_box.numClick(num);

    return false;
  }

  {
    // lowercase characters for base > 10
    num = key.charCodeAt(0) - "a".charCodeAt(0) + 10;
    if ((num >= 0) && (num < base)) {
      num_entry_box.numClick(num);
      return false;
    }
  }

  switch (e.keyCode) {
    case 13: // enter
      problems.next(); 
      return false;
      break;
  }
  return false;
}

document.onkeypress = handleKeyDown;

// digits are in reverse order, least sig in first index
function num2digits(num, base) {
  
  num = Math.floor(num);

  var digits = [];
  
  do {
    var new_digit = num % base;
    digits.push(new_digit);
    num = Math.floor(num / base); 
  } while (num != 0);

  return digits;
}

// draw an array of digits from right to left
function DigitDisplay(x, y, base, length, button_size, parent_container) {
 
  var button_size = button_size;
  var base = base;

  var boxes = [];
  var box_texts = [];
  var digits = []; 
  
  for (var i = 0; i < length; i++) {
    var box = new createjs.Shape();
    box.x = x - (button_size * (i + 1));
    box.y = y;
    
    var pad = button_size / 40.0;
    box.graphics.beginFill("#eeeeee").drawRect(
        pad, pad, button_size - pad * 2, button_size - pad * 2);
    
    parent_container.addChild(box);
    boxes.push(box);
     
    var digit = 0;
    digits.push(digit);
    
    var msg = new createjs.Text("", button_size + "px Courier", "#111");
    msg.text = digit.toString(base);
    msg.textAlign = 'center';
    var bd = msg.getBounds();
    msg.x = box.x + pad + button_size/2;
    msg.y = box.y; // - bd.height/2;
    msg.text ="x";

    parent_container.addChild(msg);
    box_texts.push(msg);
  
  }
  
  // base subscript
  var show_base = true;
  if (base == 10) show_base = false;
  if (show_base) {
    var msg = new createjs.Text("", button_size/4 + "px Courier", "#111");
    msg.text = base.toString(10);
    //msg.textAlign = 'center';
    var bd = msg.getBounds();
    msg.x = x;
    msg.y = box.y + button_size - button_size/4;

    parent_container.addChild(msg);
  }

  this.num_digits = 0;
  this.num = 0;

  this.setDigits = function(num) {
    this.num = num; 
    var new_digits = num2digits(num, base);
    
    for (var i = 0; i < digits.length; i++) {
      if (i < new_digits.length) {
        digits[i] = new_digits[i];
        box_texts[i].text = digits[i].toString(base);
      } else {
        digits[i] = 0;
        box_texts[i].text = "";
      }
    }
    
    this.num_digits = new_digits.length;
    //console.log(" new digits " + num + " " + new_digits.length + " " 
    //    + digits.reverse());
    stage.update(); 
  }

  this.setDigits(this.num);

  return this;
}

function Problem(operator, x, y, sz, num1, num2, parent_container) {
  this.num1 = Math.floor(num1);
  this.num2 = Math.floor(num2);
  this.operator = operator;
  // later have problem types for subtraction and multiplication and division
  if (operator === "+")
    this.answer = this.num1 + this.num2;
  if ((operator === "x") ||
      (operator === "*")) {
    this.answer = this.num1 * this.num2;
  }
  if (operator === ">") 
    this.answer = (this.num1 > this.num2) ? 1 : 0;
  if (operator === "<") 
    this.answer = (this.num1 < this.num2) ? 1 : 0;


  //console.log("problem " + this.num1 + " " + this.num2 + " " + this.answer);

  var correct = false;
  var x = x;
  var y = y;
  var sz = sz;
  // a small box
  var indicator = new createjs.Shape();
  var pad = sz/10.0;
  indicator.graphics.beginFill("#555555").drawRect(
      x + pad, y + pad, 
      sz - pad * 2, sz - pad * 2);
  parent_container.addChild(indicator);
 
  this.wasCorrect = function() {
    return correct;
  }

  this.gotWrong = function() {
    correct = false;
    indicator.graphics.clear();
    indicator.graphics.beginFill("#ff5555").drawRect(
      x + pad, y + pad, 
      sz - pad * 2, sz - pad * 2);

  }

  this.gotRight = function() {
    correct = true;
    console.log("got right");
    indicator.graphics.clear();
    indicator.graphics.beginFill("#55ff55").drawRect(
      x + pad, y + pad, 
      sz - pad * 2, sz - pad * 2);

  }
}

// the operand and underline
// Fixed to addition currently
function ProblemArea(operator, x, y, base, button_size, parent_container) {
  
  var button_size = button_size;
  var x = x;
  var y = y;
  var base = base;

  var pad = button_size/25;
  var msg = new createjs.Text(operator, button_size + "px Courier", "#111");
  parent_container.addChild(msg);
  var underline = new createjs.Shape();
  parent_container.addChild(underline);
  
  var num_digits = 0;

  this.update = function( ) {
    //var num_digits = Math.max(digit_display1.num_digits, digit_display2.num_digits);
    var max_answer_length = num2digits(problems.max_answer, base).length;
    num_digits = max_answer_length + 1; //Math.max(max_answer_length, num_digits + 1);
    console.log("num digits problem area " + num_digits + " " + 
        digit_display1.num_digits + " " + digit_display2.num_digits);
    underline.x = x - (num_digits) * button_size;
    underline.y = y + button_size;
    underline.graphics.clear();
    underline.graphics.beginFill("#111111").drawRect(
        0, -pad/2, button_size * (num_digits), pad);

    msg.textAlign = 'center';
    var bd = msg.getBounds();
    msg.x = x - (num_digits - 0.5) * button_size;
    msg.y = y;
  }

  this.update();

  return this;
}

// TODO refactor to use DigitDisplay
function NumEntryBox(x, y, base, button_size, parent_container, num_digits) {
  
  var button_size = button_size;
  var base = base;
  var x = x;
  var y = y;
  var digits = [];
  var boxes = [];
  var box_texts = [];
  var num_digits = num_digits;
  var cur_ind = num_digits - 1;
  
  var pad = button_size / 30.0;

  // show whether user got problem right or now
  {
  var indicator = new createjs.Shape();
  var indicator_pad = button_size / 6.0;
  indicator.graphics.beginFill("#ff5555").drawRect(
      x + indicator_pad, y + indicator_pad, 
      button_size - indicator_pad * 2, button_size - indicator_pad * 2);
  parent_container.addChild(indicator);
  var indicator_msg = new createjs.Text("", button_size + "px Courier", "#111");
  indicator_msg.x = x + button_size/2;
  indicator_msg.y = y + pad/2;
  indicator_msg.textAlign = 'center';
  parent_container.addChild(indicator_msg);
  }
  
  var selectBox = function(ind) {
    boxes[ind].graphics.clear();
    boxes[ind].graphics.beginStroke("#111").beginFill("#aaffaa").drawRect(
        pad, pad, button_size - pad * 2, button_size - pad * 2);
    box_texts[ind].color = "#555";
  }
  
  var unSelectBox = function(ind) {
 
    boxes[ind].graphics.clear();
    boxes[ind].graphics.beginFill("#eeeeee").drawRect(
        pad, pad, button_size - pad * 2, button_size - pad * 2);
    box_texts[ind].color = "#000";
  }

  for (var i = 0; i < num_digits; i++) {

    var box = new createjs.Shape();
    box.x = x - button_size * (i + 1);
    box.y = y;

    parent_container.addChild(box);
    boxes.push(box);

    var digit = -1;
    digits.push(digit);
    
    var msg = new createjs.Text("", button_size + "px Courier", "#111");
    msg.text = digit.toString(base);
    msg.textAlign = 'center';
    var bd = msg.getBounds();
    msg.x = box.x + pad + button_size/2;
    msg.y = box.y;
    msg.text ="";

    parent_container.addChild(msg);
    box_texts.push(msg);
    
    unSelectBox(i);
  }
 
  if (false) {
  var cur_underline = new createjs.Shape();
  cur_underline.x = x - (cur_ind + 1) * button_size;
  cur_underline.y = y + button_size;
  cur_underline.graphics.beginFill("#919591").drawRect(pad, 0, button_size - pad * 2, pad);
  parent_container.addChild(cur_underline);
  }

  this.checkAnswer = function() {
    var answer = 0;
    var factor = 1;
    for (var i = 0; i < digits.length; i++) {
      answer += digits[i] * factor;
      factor *= base;
    }
    console.log("answer " + answer + " " + problems.getAnswer());
    
    if (answer === problems.getAnswer()) {
      indicator.graphics.clear();
      indicator.graphics.beginFill("#11ee11").drawRect(
          x + indicator_pad, y + indicator_pad, 
          button_size - indicator_pad * 2, button_size - indicator_pad * 2);
      indicator_msg.text = "\u2714";
      problems.gotRight();
      if (auto_next) problems.next();
    } else {
      indicator.graphics.clear();
      indicator.graphics.beginFill("#ff5555").drawRect(
          x + indicator_pad, y + indicator_pad, 
          button_size - indicator_pad * 2, button_size - indicator_pad * 2);
      indicator_msg.text = "";
      problems.gotWrong();
    }
    stage.update();
  }
  

  this.numClick = function(num) {
    if (numpad != null)
      numpad.highlight(num);
    if (num >= base) return;  

    digits[cur_ind] = num;

    unSelectBox(cur_ind);

    box_texts[cur_ind].text = digits[cur_ind].toString(base);
    //console.log("entered digit " + digits[cur_ind]);
    cur_ind -= 1;
    cur_ind = (cur_ind + num_digits) % num_digits;
    //cur_underline.x = x - (cur_ind + 1) * button_size;
    
    selectBox(cur_ind);
    
    this.checkAnswer(); 
  }
  
  this.numClickEvt = function(evt, data) {
    data.that.numClick(data.num); 
  }
  
  this.clear = function() {
    for (var i = 0; i < box_texts.length; i++) {
      digits[i] = -1;
      
      box_texts[i].text = "";
    }
    unSelectBox(cur_ind);
    cur_ind = num_digits - 1;
    selectBox(cur_ind);
    this.checkAnswer();
    stage.update();
  }

  this.clear();
  

  return this;
}


function NumButton(x, y, sz, num, parent_container) {
  var num = num;
  var sz = sz; 
  var button = new createjs.Shape();
  button.x = x;
  button.y = y;
  var pad = sz / 30.0;
  parent_container.addChild(button);
  
  this.connect = function(num_entry_box) {
    button.on("click", num_entry_box.numClickEvt, null, false, {that:num_entry_box,num:num});
  }

  var msg = new createjs.Text("", sz + "px Courier", "#111");
  msg.text = num.toString(base);
  msg.textAlign = 'center';
  var bd = msg.getBounds();
  msg.x = x + pad + sz/2;
  msg.y = y - sz/16;
  parent_container.addChild(msg);

  this.unHighlight = function() {
    button.graphics.clear();
    button.graphics.beginFill("#eeeeee").drawRect(
      pad, pad, sz - pad * 2, sz - pad * 2);

  }
  this.highlight = function() {
    console.log("highlight " + num);
    button.graphics.clear();
    button.graphics.beginFill("#cbcbcb").drawRect(
      pad, pad, sz - pad * 2, sz - pad * 2);
  }

  this.unHighlight();
  //
  return this;
}

function NumPad(base, parent_container) {

  var base = base;

  container = new createjs.Container();
  parent_container.addChild(container);
 

  var sz = ht / 5;
  if (base < 3)
    sz = ht / 3;
  else if (base < 5)
    sz = ht / base;

  var buttons_per_column = Math.floor(ht / sz);
  if (base % 4 == 0)
    buttons_per_column = 4
  var x_start = wd - sz * Math.ceil(base / buttons_per_column);

  var num_buttons = [];

  this.min_x = x_start;

  for (var i = 0; i < base; i++) {
    var x = x_start + sz * Math.floor(i / buttons_per_column);
    if (x < this.min_x) min_x = x;
    var y = (i % buttons_per_column) * sz; 
    var num_button = new NumButton(x, y, sz, i, container);
    num_buttons.push(num_button);
    //num_buttons[0].highlight();
  }
  
  this.connectButtons = function(num_entry_box) {
    for (var i = 0; i < num_buttons.length; i++) {
      num_buttons[i].connect(num_entry_box);
    }
   // num_entry_box.checkAnswer();
  }

  this.highlight = function(num) {
    for (var i = 0; i < num_buttons.length; i++) {
      if (i === num) {
        console.log("highlighting " + i);
        num_buttons[i].highlight();
      } else {
        num_buttons[i].unHighlight();
      }
    }
    stage.update();
  }


  return this;
}


function Problems(operator, x, min_op1, max_op1, min_op2, max_op2) {
  
  var min_op1 = min_op1;
  var max_op1 = max_op1;
  var min_op2 = min_op2;
  var max_op2 = max_op2;

  var ind = 0;
  var all = [];

  this.max_answer = 0;

  // TODO there is a problem with max_op1 generation too big of operands
  var sz = 10;
  for (var i = min_op1; i < max_op1; i++) {
    for (var j = min_op2; j < max_op2; j++) {
      var ind = (i - min_op1) + (j - min_op2) * (max_op1 - min_op1);
      var num_row = Math.floor(x / sz);
      var px = sz + sz * (ind % num_row);
      var py = sz + sz * Math.floor(ind / num_row);
      var prob = new Problem(operator, px, py, sz, i, j, stage);
      if (prob.answer > this.max_answer) this.max_answer = prob.answer;
      all.push(prob);
    }
  }
  

  this.next = function() {
    // should have a mode where there can be weights for 
    // how likely a problem should be - problems that haven't
    // been attempted should have high weights, and problems that were
    // right should have low, or even zero weight so they don't come up again
    ind = Math.floor(Math.random() * all.length);
    // for now just make correct problems a little less likely
    if (all[ind].wasCorrect())
      ind = Math.floor(Math.random() * all.length);

    digit_display1.setDigits(all[ind].num1);
    digit_display2.setDigits(all[ind].num2);
    num_entry_box.clear();
    problem_area.update();
  }
  

  this.getAnswer = function() {
    return all[ind].answer;
  }

  this.gotRight = function() {
    all[ind].gotRight();
  }

  this.gotWrong = function() {
    all[ind].gotWrong();
  }

  return this;
}

// later pass this in via web form or url args
var base = 10;

function init() {
  stage = new createjs.Stage("mathtest");

  wd = stage.canvas.width;
  ht = stage.canvas.height;

  var context = stage.canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;

  button_size = ht/6;

  var url_base = getURLParameter("base");
  // base = 1 isn't supported yet
  if (!isNaN(url_base) && (url_base > 1)) {
    base = url_base;
  }
  
  var url_auto_next = getURLParameter("auto_next");
  if (!isNaN(url_auto_next) && (url_auto_next >= 0)) {
    auto_next = (url_auto_next > 0);
  }

  var min_op1 = 0;
  var max_op1 = 20;
  var min_op2 = 0;
  var max_op2 = 3;

  var tmp = getURLParameter("min_op1");
  if (!isNaN(tmp) && (tmp >= 0)) {
    min_op1 = tmp;
  }
  var tmp = getURLParameter("max_op1");
  if (!isNaN(tmp) && (tmp > 0)) {
    max_op1 = tmp;
  }
  var tmp = getURLParameter("min_op2");
  if (!isNaN(tmp) && (tmp >= 0)) {
    min_op2 = tmp;
  }
  var tmp = getURLParameter("max_op2");
  if (!isNaN(tmp) && (tmp > 0)) {
    max_op2 = tmp;
  }

  var operator = "+";
  var tmp = getURLParameter("operator");
  if ((tmp != null) && (tmp.length == 1)) {
    operator = tmp;  
  }
  console.log("ops " + min_op1 + " - " + max_op1 + ", " + min_op2 + " - " + max_op2);


  var display_button_size = button_size * 0.8; //2.0/3.0;
  
  numpad = new NumPad(base, stage);
  var x = numpad.min_x - 1.5 * display_button_size;
  
  problems = new Problems(operator, x, min_op1, max_op1, min_op2, max_op2);
  
  var max_length = num2digits(problems.max_answer, base).length;
  console.log("max length " + max_length);
  num_entry_box = new NumEntryBox(x, display_button_size * 4, base, 
        display_button_size, stage, max_length);
  numpad.connectButtons(num_entry_box);
  
  digit_display1 = new DigitDisplay(x, display_button_size * 2, 
      base, max_length, display_button_size, stage);
  digit_display2 = new DigitDisplay(x, display_button_size * 3, 
      base, max_length, display_button_size, stage);
  problem_area = new ProblemArea(operator, x, display_button_size * 3, 
      base, display_button_size, stage);

  problems.next();

  // next button
  {
    var next_button = new createjs.Shape(); 
    stage.addChild(next_button);
    
    var pad = button_size / 30.0
    next_button.x = 0;
    next_button.y = ht - 1.5* button_size;
    next_button.graphics.beginFill("#ddffcc").drawRect(
        pad, pad, 2 * button_size - pad * 2, 1.5 * button_size - pad * 2);
    
    next_button.on("click", problems.next);

    var msg = new createjs.Text("->", button_size + "px Courier", "#111");
    msg.textAlign = 'center';
    var bd = msg.getBounds();
    msg.x = next_button.x + pad + bd.width/2 + button_size/3;
    msg.y = next_button.y + 1.5 / 2.0 * button_size - bd.height/1.5;
    stage.addChild(msg);
  }

  stage.update();
}
