let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");
    if (n > slides.length) {
        slideIndex = 1
    }
    if (n < 1) {
        slideIndex = slides.length
    }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}

let fileSize = [0, 0, 0, 0, 2];

function downloadPhotoshop(index) {
    let img = document.getElementsByClassName("slideshow-container")[0].getElementsByClassName("mySlides")[index-1].getElementsByTagName("img")[0].src;
    img = img.substring(0, img.length-3);
    downloadFile(img + "zip");
    for(let i = 0; i<fileSize[index]; i++)
        downloadFile(img + "z" + ((""+(i+1)).length === 1 ? "0" : "") + (i+1));
}

function downloadC4D(index) {
    let img = document.getElementsByClassName("slideshow-container")[0].getElementsByClassName("mySlides")[index-1].getElementsByTagName("img")[0].src;
    img = img.substring(0, img.length-3);
    downloadFile(img + "zip");
    for(let i = 0; i<fileSize[index]; i++)
        downloadFile(img + "z" + ((""+(i+1)).length === 1 ? "0" : "") + (i+1));
}

function downloadImage(index) {
    let img = document.getElementsByClassName("slideshow-container")[0].getElementsByClassName("mySlides")[index-1].getElementsByTagName("img")[0].src;
    downloadFile(img);
}

function downloadFile(path) {
    let a = document.createElement("a");
    a.href = path;
    a.download = decodeURIComponent(path.split("/")[path.split("/").length - 1]);
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function lightswitch() {
    if (document.body.classList.contains("light")) {
        document.body.classList.remove("light");
    } else {
        document.body.classList.add("light");
    }
}
