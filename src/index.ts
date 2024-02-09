import './scss/styles.scss';

//********импорт библиотек */
import { API_URL, CDN_URL } from "./utils/constants";
import { EventEmitter } from './components/base/events';
import { Page } from "./components/Page";
import { cloneTemplate, createElement, ensureElement } from "./utils/utils";
import { Card } from './components/Card';
import { AppState, CatalogChangeEvent, LotItem } from "./components/AppData";
import { AuctionAPI } from './components/AuctionAPI';
import { Modal } from "./components/common/Modal";
import { Basket } from "./components/common/Basket";
import { PayButtons, IOrderForm, IItem } from './types';
import { Order, OrderPay } from './components/Order';
import { Success } from './components/common/Success';

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');        //темплейт карточки для главной страницы
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');     //темплейт ПРЕВЬЮ
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');       //темплейт  КОРЗИНА
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');      //темплейт для элемнтов в корзине
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');     //темплейт офрмление
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');     //темплейт контактов
const successTemplate = ensureElement<HTMLTemplateElement>('#success');     //заказ оформлен

//инициалиазция экземпляров
const events = new EventEmitter();        //Экземпляр работающий с событиями
const api = new AuctionAPI(CDN_URL, API_URL);       //Экземпляр для работы с данными
const appData = new AppState({}, events);      //Экземпляр хранить в себе информацию карточек
const page = new Page(document.body, events);      //Экземпляр для работы с основным окном
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events, page);      //Экземпляр для работы с модалным окном
const basket = new Basket(cloneTemplate(basketTemplate), events);      //Экземпляр хранить в себе информацию КОРЗИНЫ
const orderPay = new OrderPay(cloneTemplate(orderTemplate), events);      //Экземпляр хранить в себе информацию об оплате
const contactList = new Order(cloneTemplate(contactsTemplate), events);      //Экземпляр хранить в себе информацию о контактах
const success = new Success(cloneTemplate(successTemplate), { onClick: () => { events.emit('order:send') } });      //Экземпляр хранить в себе информацию заврешение заказа

//********************

api.getLotList()        //ПОЛУЧИТ ДАННЫЕ С СЕРВЕРА
    .then(appData.setCatalog.bind(appData))     //Запишет в экземпляр appData
    .catch(err => {
        console.error(err);
    });

//********************
events.on('items:changed', () => {      //НАПОЛНЕНИЕ КАРТОЧКАМИ страницы page
    page.catalog = appData.catalog.map(item => {        //Добавить все карточки в каталоге в каталог на главной странице 
        const card = new Card('card', cloneTemplate(cardCatalogTemplate), {     //Создать карточку из темплейта, назначить ей событие при клике на нее
            onClick: () => events.emit('card:select', item)     //Событие сработает когда произойдети клик по карточке 
        });

        return card.render({        //вернуть карточку ввиде ХТМЛ разметки
            title: item.title,
            image: item.image,
            description: item.about,
            category: item.category,
            price: item.price
        });
    });
});

//********************
events.on('card:select', (item: LotItem) => {       //СОБЫТИЕ "клик на карточку" на старице page
    page.locked = true;    //Блокируем прокрутку основного экрана

    const card = new Card('card', cloneTemplate(cardPreviewTemplate), {     //Создать новый объект из шаблона
        onClick: () => {
            events.emit('basket:click', item);      //Вызвать событие которое добват карточку в корзину
        }
    });

    modal.render({      // Рендреим карточку в модальное окно
        content: card.render({
            title: item.title,
            image: item.image,
            description: item.about,
            category: item.category,
            price: item.price
        })
    });

    card.checkPrice = item;       //Проверка цены у товара, есть проблемные карточки
    card.switchButton = item;       //Изменить название кнопки если товар уже в корзине
});

//********************
events.on('basket:click', ((item: LotItem) => {     //НАЖАТА КНОПКА ДОБАВИТЬ В КОРЗИНУ
    if (item.status === 'NOADD') {
        appData.addItemInBasket = item;     //Запомнить купленный товар
        item.status = 'ADD';        //Добавить статус в корзине
        page.counter = appData.order.items.length;      //Устанавливаем счетчик на главном окне
    } else {
        appData.deleteItemOrder(item);      //Удалить карточку из корзины
    }
    modal.close();
    page.counter = appData.order.items.length;      //Устанавливаем счетчик на главном окне
}));

//********************
events.on('basket:open', (() => {       //НАЖАЛИ НА КОРЗИНУ


    basket.selected = appData.order.items;       //Блокируем кнопку оформить если товара нет 
    basket.total = appData.getTotal();         //Отобразить Сумму все товаров в корзине

    basket.items = appData.order.items.map((item: IItem) => {      //Добавить шаблоны карточек для отображения в корзине

        const card = new Card('card', cloneTemplate(cardBasketTemplate),    //Создаст разметку для корзины из шаблона
            { onClick: () => { events.emit('Basket:itemDelete', item) } });       //Событие на удаление товара изкорзины

        return card.render({ title: item.title, price: item.price })

    })

    modal.render(   // Рендреим карточку в модальное окно
        { content: basket.render() });

}));

//******************** НАЖАЛИ КНОПКУ удалить карточку из корзины
events.on('Basket:itemDelete', (item: LotItem) => {
    appData.deleteItemOrder(item)       //Удалить карточку из ордера
    events.emit('basket:open')      //обновить состояние
    page.counter = appData.order.items.length;      //Устанавливаем счетчик на главном окне
})


//******************** Открыть форму Для заполнения оплаты и адреса
events.on('order:open', () => {

    modal.render({
        content: orderPay.render({
            valid: false,
            errors: []
        })
    })

});

// Изменилось состояние валидации формы
events.on('formErrorsPay:change', (errors: Partial<IOrderForm>) => {
    const { address, payment } = errors;
    orderPay.valid = !address && !payment;
    orderPay.errors = Object.values({ address, payment }).filter(i => !!i).join('; ');
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
    const { phone, email } = errors;
    contactList.valid = !email && !phone;
    contactList.errors = Object.values({ phone, email }).filter(i => !!i).join('; ');
});


//Изменился способ оплаты
events.on('pay:change', (data: PayButtons) => {
    orderPay.addClass(data.currentButton, appData.checkPay(data))
    events.emit('order.pay:change', {
        field: 'payment',
        value: data.currentButton.name
    });
})


// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderFieldPay(data.field, data.value);      //записываем данные в экземпляр
});


// Оформление телефона и имени
events.on('order:submit', () => {
    modal.render({
        content: contactList.render({
            valid: false,
            errors: []
        })
    })
});

// Изменилось одно из полей
events.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);      //записываем данные в экземпляр
});

// Оформление завершение оформления
events.on('contacts:submit', () => {

    api.orderLots({
        address: appData.order.address,
        payment: appData.order.payment,
        email: appData.order.email,
        phone: appData.order.phone,
        total: appData.getTotal(),
        items: appData.getIdOrder
    }).then((response) => {
        success.totalPrice = response.total;
        modal.render({
            content: success.render()
        })
    })
});

events.on('order:send', () => {
    modal.close();
    appData.order = {
        address: '',
        payment: '',
        email: '',
        phone: '',
        items: []
    };
    page.counter = appData.order.items.length;      //Устанавливаем счетчик на главном окне
    appData.clearBasket();      //очистить каталог от статусов помещенных в корзину
})

