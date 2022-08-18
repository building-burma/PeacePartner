const form = document.getElementById("register_form");

window.onload = () => {
    const sponsorArray = Array.from(document.getElementsByClassName("sponsor"));
    const refugeeArray = Array.from(document.getElementsByClassName("refugee"));
    const afterChoiceArray = Array.from(document.getElementsByClassName("after-choice"));

    form.onchange = (e) => {
        afterChoiceArray.forEach((i) => {
            i.style.display = "block";
        });

        if (form.elements['type'].value === "SP") {
            sponsorArray.forEach((i) => {
                i.style.display = "block";
            })
            refugeeArray.forEach((i) => {
                i.style.display = "none";
            })
        }
        if (form.elements['type'].value === "RU") {
            sponsorArray.forEach((i) => {
                i.style.display = "none";
            })
            refugeeArray.forEach((i) => {
                i.style.display = "block";
            })
        }
    }
}