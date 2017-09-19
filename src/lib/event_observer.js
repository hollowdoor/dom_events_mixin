export default class EventObserver {
    constructor({
        handle = null,
        remove = ()=>{}
    } = {}){
        this._handle = handle;
        this._remove = remove;
    }
    emit(ctx, event){
        return this._handle(ctx, event);
    }
    remove(){
        this._remove();
    }
}
