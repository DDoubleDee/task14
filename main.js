const itemlist = document.querySelector("item-list"),
    machinecreationmenu = document.querySelector("machine-creation-menu"),
    main = document.querySelector("main"),
    mainb = document.querySelector("main button"),
    loginform = document.querySelector("login-form"),
    logout = document.querySelector("header button"),
    host = "http://task12/alatech/api"

let await = false,
    currentDrag,
    clientHeight,
    clientWidth,
    transition,
    token = window.localStorage.getItem("token"),
    axiosi

if(token){
    logout.style.display = "block"
    loginform.style.display = "none"
}

function logIn() {
    const inputs = loginform.querySelectorAll("input")
    // axios.post(host + '/login', {username: inputs[0].value, password: inputs[1].value})
    // .then((answer) => {
        // console.log(answer)
        logout.style.display = "block"
        $({ timer: 0 }).animate({ timer: 100 }, {
            duration: 500, step: (now) => { loginform.children[0].style.left = `${now}vw`; loginform.style.filter = `opacity(${(100 - now) / 100})` }, complete: () => {
                loginform.style.display = "none"
            }
        })
    // })
    // .catch((error) => {
        // console.log(error)
    // })
}
function logOut() {
    window.localStorage.setItem("token", null)
    loginform.children[0].style.left = `${0}vw`
    loginform.style.filter = `opacity(${(100 - 0) / 100})`
    loginform.style.display = "flex"
    logout.style.display = "none"
}
function machineClick(ev) {
    if (await) { return }
    toggleScreen()
}
function toggleScreen() {
    if (await) { return }
    await = true
    $({ timer: 0 }).animate({ timer: 100 }, {
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
function floatBack(ev) {
    if (currentDrag) {
        let targetX = currentDrag.parentElement.offsetLeft + currentDrag.parentElement.clientWidth / 2 - clientWidth / 2,
            targetY = currentDrag.parentElement.offsetTop + currentDrag.parentElement.offsetHeight / 2 + clientHeight / 8.5,
            fromY = clientHeight / 2 + ev.clientY - clientHeight,
            fromX = clientWidth / 2 + ev.clientX - clientWidth
        console.log(`${currentDrag.parentElement.offsetTop} ${currentDrag.parentElement.clientHeight} ${targetY}`)
        $({ Y: fromY, X: fromX }).animate({ Y: targetY, X: targetX }, {
            duration: 1000, step: (Y, X) => { if (X.prop == 'X') { currentDrag.style.left = `${X.now}px` } else { currentDrag.style.top = `${X.now}px` } }, complete: () => {
                currentDrag.style.top = null
                currentDrag.style.left = null
                currentDrag.style.zIndex = "88"
                currentDrag.style.position = "absolute"
                currentDrag.style.transition = transition
                currentDrag.querySelector("img").style.cursor = "pointer"
                currentDrag.classList.remove("no-hover")
                currentDrag = null
            }
        })
    }
}
window.addEventListener("mousedown", (ev) => {
    console.log(`${ev.clientY} ${ev.clientX}`)
})
window.addEventListener("mouseup", (ev) => {
    window.removeEventListener("mousemove", track)
    floatBack(ev)
})
function mouseDown() {
    window.addEventListener("mousemove", track)
}
function track(ev) {
    currentDrag.style.position = "fixed"
    currentDrag.style.top = `${clientHeight / 2 + ev.clientY - clientHeight}px`
    currentDrag.style.left = `${clientWidth / 2 + ev.clientX - clientWidth}px`
}
function dragStart(ev) {
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