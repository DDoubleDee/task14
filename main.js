const itemlist = document.querySelector("item-list"),
    machinecreationmenu = document.querySelector("machine-creation-menu"),
    main = document.querySelector("main"),
    mainb = document.querySelector("main button"),
    loginform = document.querySelector("login-form"),
    logout = document.querySelector("header button"),
    host = "http://127.0.0.1:8000/alatech/api",
    itemtemplate = document.querySelector("#item"),
    sdtemplate = document.querySelector("#storage-device"),
    partlist = document.querySelector("part-list"),
    select = document.querySelector("select"),
    machinepartcontainers = document.querySelectorAll("machine-part-container")

let await = false,
    currentDrag,
    clientHeight,
    clientWidth,
    transition,
    token = window.localStorage.getItem("token"),
    axiosi,
    currentparttype = "motherboards"

mainb.setAttribute("value", 0)

if (token) {
    logout.style.display = "block"
    loginform.style.display = "none"
    axiosi = axios.create({  // create axios instance
        baseURL: host,
        timeout: 4000,
        headers: { "Authorization": "Bearer " + token }
    })
    loadMain("machines")
}

function loadMain(type) {
    itemlist.innerHTML = ""
    loadItems(type, itemlist, false)
}

function loadParts() {
    partlist.querySelectorAll("item-container").forEach(element => {
        element.remove()
    });
    loadItems(select.value, partlist, true)
}

function loadItems(type, where, drag) { // populate list with items
    if (axiosi) {
        axiosi.get(type)
            .then((answer) => {
                console.log(answer.data)
                answer.data.forEach(element => {
                    const clone = itemtemplate.content.cloneNode(true)
                    formClone(type, element, clone)
                    if(drag){
                        clone.querySelector("single-item").addEventListener("mousedown", mouseDown)
                        clone.querySelector("single-item").addEventListener("dragstart", dragStart)
                        clone.querySelector("single-item").setAttribute("draggable", true)
                    }
                    where.appendChild(clone)
                });
            })
            .catch((error) => {
                console.log(error)
            })
    }
}

function formClone(type, element, clone) { // different elements need different details
    clone.querySelector("item-title").textContent = element.name
    clone.querySelector("img").src = "/alatech/api/images/" + element.imageUrl
    if (type == "machines") {
        clone.querySelector("item-details").textContent = element.description
        clone.querySelector("single-item").setAttribute("value", element.id)
        clone.querySelector("img").setAttribute("value", element.id)
        clone.querySelector("item-details").setAttribute("value", element.id)
    } else if (type == "motherboards") {
        clone.querySelector("item-details").innerHTML = `Socket Type: ${element.socketType.name} <br> maxTdp: ${element.maxTdp} <br> RAM Type: ${element.ramMemoryType.name} <br> RAM Slots: ${element.ramMemorySlots} <br> PCI Slots: ${element.pciSlots} <br> SATA Slots: ${element.sataSlots} <br> M2 Slots: ${element.m2Slots}`
    } else if (type == "power-supplies") {
        clone.querySelector("item-details").innerHTML = `80Plus: ${element.badge80Plus} <br> Potency: ${element.potency} <br> Brand: ${element.brand.name}`
    } else if (type == "processors") {
        clone.querySelector("item-details").innerHTML = `Socket Type: ${element.socketType.name} <br> TDP: ${element.tdp} <br> Cache Memory: ${element.cacheMemory} <br> Base Frequency: ${element.baseFrequency} <br> Max Frequency: ${element.maxFrequency} <br> Brand: ${element.brand.name}`
    } else if (type == "ram-memories") {
        clone.querySelector("item-details").innerHTML = `RAM Size: ${element.size} <br> RAM Type: ${element.ramMemoryType.name} <br> Frequency: ${element.frequency} <br> Brand: ${element.brand.name}`
    } else if (type == "graphic-cards") {
        clone.querySelector("item-details").innerHTML = `Minimum Power Supply: ${element.minimumPowerSupply} <br> Support Multiple GPUs? ${element.supportMultiGpu ? "Yes" : "No"} <br> Memory Size: ${element.memorySize} <br> Memory Type: ${element.memoryType} <br> Brand: ${element.brand.name}`
    } else {
        clone.querySelector("item-details").innerHTML = `Storage Type: ${element.sorageDeviceType} <br> Storage Interface: ${element.storageDeviceInterface} <br> Size: ${element.size} <br> Brand: ${element.brand.name}`
    }
}

function logIn() {
    const inputs = loginform.querySelectorAll("input")
    axios.post(host + '/login', { username: inputs[0].value, password: inputs[1].value })
        .then((answer) => {
            window.localStorage.setItem("token", answer.data.token)
            axiosi = axios.create({ // create axios instance
                baseURL: host,
                timeout: 4000,
                headers: { "Authorization": "Bearer " + answer.data.token }
            })
            logout.style.display = "block"
            loadMain("machines") // load main items
            $({ timer: 0 }).animate({ timer: 100 }, {
                duration: 500, step: (now) => { loginform.children[0].style.left = `${now}vw`; loginform.style.filter = `opacity(${(100 - now) / 100})` }, complete: () => {
                    loginform.style.display = "none"
                }
            })
        })
        .catch((error) => {
            console.log(error)
        })
}
function logOut() {
    axiosi.delete("logout")
        .then(() => {
            window.localStorage.setItem("token", null)
            loginform.children[0].style.left = `${0}vw`
            loginform.style.filter = `opacity(${(100 - 0) / 100})`
            loginform.style.display = "flex"
            logout.style.display = "none"
        })
        .catch((error) => {
            console.log(error)
        })
}
function machineClick(ev) {
    if (await) { return }
    if (ev.target.getAttribute("value") === null) { return }
    if (itemlist.style.display != "none") {
        loadParts() // load machine parts
    }
    toggleScreen() // change screens
}
function toggleScreen() {
    if (await) { return }
    await = true
    $({ timer: 0 }).animate({ timer: 100 }, { // animate down and up
        easing: "swing", duration: 1000, step: (now) => { main.style.marginTop = `${now}vh` }, complete: () => {
            if (itemlist.style.display == "none") {
                itemlist.style.display = "grid"
                machinecreationmenu.style.display = "none"
                mainb.innerText = "Create new machine"
            } else {
                itemlist.style.display = "none"
                machinecreationmenu.style.display = "grid"
                mainb.innerText = "Create machine"
            }
            $({ timer: 100 }).animate({ timer: 0 }, {
                easing: "swing", duration: 1000, step: (now) => { main.style.marginTop = `${now}vh` }, complete: () => {
                    await = false
                }
            })
        }
    })
}
function floatBack(ev) { // animate drop
    if (currentDrag) {
        let dropped
        machinepartcontainers.forEach(element => { // iterate over all machine parts and check if item was dropped correctly
            let y = (element.offsetTop + element.clientHeight / 2 + 70),
                x = (element.offsetLeft + element.clientWidth / 2)
                console.log({y: y, x: x, cy: ev.clientY, cx: ev.clientX, height: element.clientHeight / 2, width: element.clientWidth / 2, top: element.offsetTop, left: element.offsetLeft, elem: element})
            if (y + 70 > ev.clientY && x + 70 > ev.clientX && y - 70 < ev.clientY && x - 70 < ev.clientX && element.classList.contains("droppable")) {
                dropped = element
            }
            element.classList.remove("dim")
            element.classList.remove("droppable") // clean classes
        });
        let target = currentDrag.parentElement
        if (dropped) { // set target for animation
            target = dropped
        } else {
            currentDrag.style.filter = "opacity(0.6)" // if incorrect change visual
            currentDrag.style.boxShadow = "inset red 0px 0px 3px 1px, red 0px 0px 3px 4px"
        }
        let targetX = target.offsetLeft + target.clientWidth / 2 - clientWidth / 2,
            targetY = target.offsetTop + target.offsetHeight / 2 + clientHeight / 8.5,
            fromY = clientHeight / 2 + ev.clientY - clientHeight,
            fromX = clientWidth / 2 + ev.clientX - clientWidth // calculate animation values
        $({ Y: fromY, X: fromX }).animate({ Y: targetY, X: targetX }, {
            duration: 1000, step: (Y, X) => { if (X.prop == 'X') { currentDrag.style.left = `${X.now}px` } else { currentDrag.style.top = `${X.now}px` } }, complete: () => {
                currentDrag.style.top = null
                currentDrag.style.left = null
                currentDrag.style.zIndex = "88"
                currentDrag.style.position = "absolute"
                currentDrag.style.transition = transition
                currentDrag.style.filter = null
                currentDrag.style.boxShadow = null
                currentDrag.querySelector("img").style.cursor = "pointer" // reset styles
                currentDrag.classList.remove("no-hover")
                if (dropped) {
                    if (dropped == machinepartcontainers[5]) { // check if it's a storage device
                        let sd = sdtemplate.content.cloneNode(true)
                        sd.querySelector("storage-device-title").innerHTML = currentDrag.querySelector("item-title").innerHTML
                        sd.querySelector("img").src = currentDrag.querySelector("img").src
                        dropped.querySelector("machine-part-body").appendChild(sd)
                    } else if (dropped == machinepartcontainers[0]) { // check if motherboard
                        machinepartcontainers.forEach(element => {
                            element.querySelector("machine-part-body").innerHTML = "" // clean all
                        });
                        let drop = dropped.querySelector("machine-part-body")
                        drop.appendChild(currentDrag.parentElement.cloneNode(true))
                    } else {
                        let drop = dropped.querySelector("machine-part-body")
                        drop.innerHTML = "" // clean previous
                        drop.appendChild(currentDrag.parentElement.cloneNode(true))
                    }
                }
                currentDrag = null // clean dragged item
            }
        })
    }
}
window.addEventListener("mouseup", (ev) => {
    window.removeEventListener("mousemove", track) // stop tracking
    floatBack(ev)
})
function mouseDown() {
    prepareDrop()
    window.addEventListener("mousemove", track) //start tracking item
}
function prepareDrop() {
    switch (select.value) { // add visuals
        case "motherboards":
            machinepartcontainers.forEach(element => {
                element.classList.add("dim")
            });
            machinepartcontainers[0].classList.remove("dim")
            machinepartcontainers[0].classList.add("droppable")
            break;
        case "processors":
            machinepartcontainers.forEach(element => {
                element.classList.add("dim")
            });
            machinepartcontainers[1].classList.remove("dim")
            machinepartcontainers[1].classList.add("droppable")
            break;
        case "ram-memories":
            machinepartcontainers.forEach(element => {
                element.classList.add("dim")
            });
            machinepartcontainers[2].classList.remove("dim")
            machinepartcontainers[2].classList.add("droppable")
            break;
        case "power-supplies":
            machinepartcontainers.forEach(element => {
                element.classList.add("dim")
            });
            machinepartcontainers[3].classList.remove("dim")
            machinepartcontainers[3].classList.add("droppable")
            break;
        case "graphic-cards":
            machinepartcontainers.forEach(element => {
                element.classList.add("dim")
            });
            machinepartcontainers[4].classList.remove("dim")
            machinepartcontainers[4].classList.add("droppable")
            break;
        case "storage-devices":
            machinepartcontainers.forEach(element => {
                element.classList.add("dim")
            });
            machinepartcontainers[5].classList.remove("dim")
            machinepartcontainers[5].classList.add("droppable")
            break;
    
        default:
            break;
    }
}
function track(ev) { // animate dragged item
    currentDrag.style.position = "fixed"
    currentDrag.style.top = `${clientHeight / 2 + ev.clientY - clientHeight}px`
    currentDrag.style.left = `${clientWidth / 2 + ev.clientX - clientWidth}px`
}
function dragStart(ev) { // prepare for tracking
    ev.preventDefault()
    ev.target.classList.add("no-hover")
    currentDrag = ev.target
    transition = currentDrag.style.transition
    currentDrag.querySelector("img").style.cursor = "grab"
    currentDrag.style.transition = "all 0s"
    currentDrag.style.zIndex = "100"
    clientHeight = currentDrag.clientHeight
    clientWidth = currentDrag.clientWidth
}
function remove(ev) {
    ev.target.parentElement.parentElement.querySelector("machine-part-body").innerHTML = ""
}
function removeSd(ev) {
    ev.target.parentElement.parentElement.remove()
}