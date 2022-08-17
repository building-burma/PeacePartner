const form = document.getElementById("register_form");

window.onload = () => {
    form.onchange = (e) => {
        if (form.elements['type'].value === "SP") {
            Array.from(document.getElementsByClassName("sponsor")).forEach((i) => {
                i.style.display = "inline-block";
            })
            Array.from(document.getElementsByClassName("refugee")).forEach((i) => {
                i.style.display = "none";
            })
        }
        if (form.elements['type'].value === "RU") {
            Array.from(document.getElementsByClassName("refugee")).forEach((i) => {
                i.style.display = "inline-block";
            })
            Array.from(document.getElementsByClassName("sponsor")).forEach((i) => {
                i.style.display = "none";
            })
        }
    }
}