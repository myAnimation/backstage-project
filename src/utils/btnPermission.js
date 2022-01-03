import store from "@/store";
export function hasBtnPermission(str){
    let buttons = store.getters.buttons
    return buttons.indexOf(str) !== -1
}