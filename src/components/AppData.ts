import { Model } from "./base/Model";
import { PayButtons, FormErrors, IOrder, IOrderForm } from "../types";
import { IItem } from "../types";
import { IEvents } from "./base/events";

//Мы принимает от АПИ массив
export type CatalogChangeEvent = {
    catalog: LotItem[]
};

export class LotItem extends Model<IItem> {     //Новый класс хранящий в себе данные и метод для события
    id: string;
    title: string;
    image: string;
    description: string;
    about: string;
    category: string;
    price: number;
    status: 'ADD' | 'NOADD' = 'NOADD';
}


export class AppState extends Model<IItem> {        //Класс хранящий данные

    catalog: LotItem[];     //каталог с карточками полученная от АПИ
    order: IOrder = {
        address: '',
        payment: '',
        email: '',
        phone: '',
        items: []       //корзина, для хранения купленных товар
    };

    formErrors: FormErrors = {};

    constructor(data: Partial<IItem>, events: IEvents) {
        super(data, events);
    }

    setCatalog(items: IItem[]) {                                                 //получить Api
        this.catalog = items.map(item => new LotItem(item, this.events));       //Создать новый массив из экземпляра LotItem + событие Event
        this.emitChanges('items:changed', { catalog: this.catalog });       //Вызвать событие, карточки сформированные
    }

    set addItemInBasket(items: LotItem) {       //Запомнить покупку
        this.order.items.push(items);       //поместить карточку в order

    }
    get addItemInBasket(): any {       //Запомнить покупку
        return this.order.items;
    }

    get getIdOrder():string[] {
        return this.order.items.reduce<string[]>((accum:string[], item:LotItem) => {
            return [...accum, item.id]
        }, [])

    }


    deleteItemOrder(item: LotItem) {
        this.order.items = this.order.items.filter((element: LotItem) => {        //Ищем в корзине карточку по id
            if (element.id === item.id) {       //id нажатой карточки совпадает с id карточки в массиве 
                element.status = "NOADD"        //поставить ей статус не в корзине
                return false        //удалить из массива
            } return true           //либо оставить в массиве
        });
    }

    clearBasket() {
        this.catalog.forEach(id => {
            id.status = 'NOADD';
        });
    }

    getTotal() {        //Посчитать сумму товаров добавленных в корзину
        const sum = this.order.items.reduce((a: number, c: LotItem) => {
            return a + c.price;
        }, 0);
        return sum as number
    }

    checkAddBasket(item: LotItem): boolean {        //Если статус у товара АДД значит он добавлен в корзину
        if (item.status === 'ADD') return true
    }

    setOrderFieldPay(field: keyof IOrderForm, value: string) {
        this.order[field] = value;
        this.validateOrderPay()     //Если прошли проверку можно продолжить оформлять закза
    }

    setOrderField(field: keyof IOrderForm, value: string) {
        this.order[field] = value;
        this.validateOrder()         //Если прошли проверку можно оформлять заказ
    }

    checkPay(data: PayButtons) {       //Проверка кнопки оплаты 
        const { currentButton, allButton } = data;
        if (!currentButton.classList.contains('button_press')) {        //Класса нет
            allButton.forEach((item) => {
                if (item !== currentButton) item.classList.remove('button_press');      //У все остальных кнопок убрать состояние выделенности
            })
            return 'button_press'     // выделить кнопку
        }
    }

    validateOrderPay() {       //Проверка на заполннеость данных в экземпляре
        const errors: typeof this.formErrors = {};

        if (!this.order.payment) {
            errors.address = 'Необходимо выбрать оплату';
        }

        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }

        this.formErrors = errors;
        this.events.emit('formErrorsPay:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateOrder() {       //Проверка на заполннеость данных в экземпляре
        const errors: typeof this.formErrors = {};

        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }

        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }

        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}