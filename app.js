// Write your JS in here
pics = [
	"imgs/kitty_1.jpg",
	"imgs/kitty_2.jpg", 
	"imgs/kitty_3.jpg",
	"imgs/kitty_4.jpg",
	"imgs/kitty_5.jpg",
	"imgs/kitty_6.jpg"
]
var counter = 1;
var img = document.querySelector("img");
var btn = document.querySelector("button");
btn.addEventListener("click",function(){
	if(counter===6){
		counter = 0
	};
	img.src=pics[counter]	
	counter = counter + 1;
});


