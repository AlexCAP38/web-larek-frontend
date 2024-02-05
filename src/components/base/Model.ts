import { IEvents } from "./events";

// Гарда для проверки на модель
export const isModel = (obj: unknown): obj is Model<any> => {
    return obj instanceof Model;
}

/**
 * Базовая модель, чтобы можно было отличить ее от простых объектов с данными
 */

export abstract class Model<T> {        //Абстрактный класс где тип будет определ позже

    //Конструктор принимает параметр data где свойства T необязательные 
    //и будет принимать Паттерн Обсервейбл событие которое должно реализовать интерфейс IEvents
    constructor(data: Partial<T>, protected events: IEvents) {
        Object.assign(this, data);      //копируем свойства из data в объект this
    }

    // Сообщить всем что модель поменялась
    emitChanges(event: string, payload?: object) {
        // Состав данных можно модифицировать
        this.events.emit(event, payload ?? {});
    }

    // далее можно добавить общие методы для моделей
}