import SHA256 from "./SHA256.js";

// simple function for iterating through a list of dom nodes and setting the display value
// useful for showing and hiding stuff
function setDisplay(domElementList, displayvalue) {
    Array.from(domElementList).forEach((i) => {
        i.style.display = displayvalue;
    })
}

function gensalt(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

window.onload = () => {
    const form = document.getElementById("register_form");
    const sponsors = document.getElementsByClassName("sponsor");
    const refugees = document.getElementsByClassName("refugee");
    const country = document.getElementById("country");
    const prefcountry = document.getElementById("prefcountry");
    const pets = document.getElementById("pets")
    const pettypediv = document.getElementById("pettypediv")

    pets.onchange = (e) => {
        pettypediv.innerHTML = "";
        for (let i = 0; i < pets.value; i++) {
            let petidentifier = "pet" + i;
            pettypediv.innerHTML += `<br><label for='${petidentifier}'>Enter pet type</label><input type='text' name='${petidentifier}' id='${petidentifier}'>`;
        }
    }

    form.onchange = (e) => {
        setDisplay(document.getElementsByClassName("after-choice"), "block")

        document.getElementsByClassName("state")[0].style.display = (country.value === "US" || prefcountry.value === "US") ? "block" : "none";

        if (form.elements['type'].value === "SP") {
            setDisplay(sponsors, "block") // show sponsor elements
            setDisplay(refugees, "none") // hide refugee elements
        }
        if (form.elements['type'].value === "RU") {
            setDisplay(sponsors, "none") // hide sponsor elements
            setDisplay(refugees, "block") // show refugee elements
        }
    }

    form.onsubmit = (e) => {
        e.preventDefault();
        let valid = true;
        let target = form.elements['type'].value === "SP" ? "reqsponsor" : "reqrefugee";
        Array.from(document.getElementsByClassName(target)).forEach((i) => {
            if (i.value === "" && i.type !== "file") {
                alert(i.previousElementSibling.innerHTML + " has not been filled in")
                valid = false;
            }
        });
        if (document.getElementById("picture").files.length === 0 && target === "reqrefugee") {
            alert("Picture has not been filled in");
            valid = false;
        }
        if (valid) {
            let pass = document.querySelector("#password").value;
            let salt = form.elements['passsalt'].value = gensalt(128);
            form.elements['passhash'].value = SHA256(pass+salt);
            form.submit();
        }
    }
}