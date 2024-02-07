import './scss/styles.scss';

//********импорт библиотек */
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Page } from "./components/Page";
import { cloneTemplate, createElement, ensureElement } from "./utils/utils";
import { Card } from './components/Card';
import { AppState, CatalogChangeEvent, LotItem } from "./components/AppData";
import { AuctionAPI } from './components/AuctionAPI';
import { Modal } from "./components/common/Modal";
import { Basket } from "./components/common/Basket";
import { ILot, IOrderForm } from './types';
import { Order } from './components/Order';
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

//передаем где будет храниться медиа + основной урл
const api = new AuctionAPI('https://larek-api.nomoreparties.co/content/weblarek', 'https://larek-api.nomoreparties.co/api/weblarek');

const appData = new AppState({}, events);      //Экземпляр хранить в себе информацию карточек
const page = new Page(document.body, events);      //Экземпляр для работы с основным окном
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events, page);      //Экземпляр для работы с модалным окном
const basket = new Basket(cloneTemplate(basketTemplate), events);      //Экземпляр хранить в себе информацию КОРЗИНЫ
const order = new Order(cloneTemplate(orderTemplate), events);      //Экземпляр хранить в себе информацию об оплате
const contactList = new Order(cloneTemplate(contactsTemplate), events);      //Экземпляр хранить в себе информацию о контактах
// const success = new Success(cloneTemplate(successTemplate), {onClick:()=>{}});      //Экземпляр хранить в себе информацию заврешение заказа

//*******************************************ЛОГИКА***************************
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
    
    card.checkPrice=item;       //Проверка цены у товара
    card.switchButton = item;       //Изменить название кнопки если товар уже в корзине

    // appData.setPreview(item);       //открываем превью, передаем туда карточку
});

//******************** ПОКА ПРОПУСКАЕМ """"""""""""""""""""""
// ОТКРЫТЬ МОДАЛЬНОЕ ОКНО ПРЕВЬЮ, событие срабатывает при клик по карточке на основной странице.
// Параметр карточка по которой кликнули
events.on('preview:changed', (item: LotItem) => {

    //Создаем новый объект Карточка с темплейтом ПРЕВЬЮ
    //Класс принимает параметры: название теплейта (строку)/ НТМЛ элемент Клон превью/ событие т.к в шаблоне есть кнопка 
    const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            events.emit('basket:click', item);      //вызываем событие и закидываем туда карточку по которой кликнули  
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
});


//********************
events.on('basket:click', ((item: LotItem) => {     //НАЖАТА КНОПКА ДОБАВИТЬ В КОРЗИНУ

if (item.status === 'NOADD') {
    appData.addItemInBasket = item;     //Запомнить купленный товар
    item.status = 'ADD';        //Добавить статус в корзине
    page.counter = appData.basket.length;      //Устанавливаем счетчик на главном окне
modal.close();
}
}));

//********************
events.on('basket:open', (() => {       //НАЖАЛИ НА КОРЗИНУ

    basket.selected = appData.basket;       //Блокируем кнопку оформить если товара нет 
    basket.total = appData.getTotal();         //Отобразить Сумму все товаров в корзине
    
    basket.items =  appData.basket.map((item: ILot)=>{      //Добавить шаблоны карточек для отображения в корзине
        

        const card = new Card('card', cloneTemplate(cardBasketTemplate),    //Создаст разметку для корзины из шаблона
        { onClick: () => { events.emit('Basket:itemDelete', item) } });       //Событие на удаление товара изкорзины
        
        return card.render({title: item.title,price: item.price})
        
    })

        modal.render(   // Рендреим карточку в модальное окно
            {content: basket.render()});
        
}));

//******************** удалить карточку из корзины

events.on('Basket:itemDelete',(item:LotItem)=>{

appData.basket = appData.basket.filter((element: LotItem)=>{        //Ищем в корзине карточку по id
    if (element.id === item.id) {       //id нажатой карточки совпадает с id карточки в массиве 
        element.status = "NOADD"        //поставить ей статус не в корзине
        return false        //удалить из массива
    } return true           //либо оставить в массиве
});
events.emit('basket:open')      //обновить состояние

})


//******************** Открыть форму заказа
events.on('order:open', () => {

    modal.render({
        content: order.render({
            valid: false,
            errors: []
})
    })

});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
    const { email, phone } = errors;
    order.valid = !email && !phone;
    order.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
    appData.setOrderField(data.field, data.value);
});








//******************** Открыть форму заказа
// events.on('order:open', () => {

//     modal.render({
//         content: order.render({
//             valid: false,
//             errors: [],
//             phone: '',
//             email: ''
//         })
//     });
// });



        
        // import './scss/styles.scss';
        
        // import {AuctionAPI} from "./components/AuctionAPI";
        // import {API_URL, CDN_URL} from "./utils/constants";
        // import {EventEmitter} from "./components/base/events";
        // import {AppState, CatalogChangeEvent, LotItem} from "./components/AppData";
        // import {Page} from "./components/Page";
        // import {Auction, AuctionItem, BidItem, CatalogItem} from "./components/Card";
        // import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
        // import {Modal} from "./components/common/Modal";
        // import {Tabs} from "./components/common/Tabs";
        // import {IOrderForm} from "./types";
        // import {Order} from "./components/Order";
        // import {Success} from "./components/common/Success";
        
        // const events = new EventEmitter();
        // const api = new AuctionAPI(CDN_URL, API_URL);
        
        // // Чтобы мониторить все события, для отладки
        // events.onAll(({ eventName, data }) => {
            //     console.log(eventName, data);
            // })
            
            // // Все шаблоны
            // const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card');
            // const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#preview');
            // const auctionTemplate = ensureElement<HTMLTemplateElement>('#auction');
            // const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#bid');
            // const bidsTemplate = ensureElement<HTMLTemplateElement>('#bids');
// const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
// const tabsTemplate = ensureElement<HTMLTemplateElement>('#tabs');
// const soldTemplate = ensureElement<HTMLTemplateElement>('#sold');
// const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
// const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// // Модель данных приложения
// const appData = new AppState({}, events);

// // Глобальные контейнеры
// const page = new Page(document.body, events);
// const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// // Переиспользуемые части интерфейса
// const bids = new Basket(cloneTemplate(bidsTemplate), events);
// const basket = new Basket(cloneTemplate(basketTemplate), events);
// const tabs = new Tabs(cloneTemplate(tabsTemplate), {
//     onClick: (name) => {
//         if (name === 'closed') events.emit('basket:open');
//         else events.emit('bids:open');
//     }
// });
// const order = new Order(cloneTemplate(orderTemplate), events);

// // Дальше идет бизнес-логика
// // Поймали событие, сделали что нужно

// // Изменились элементы каталога
// events.on<CatalogChangeEvent>('items:changed', () => {
//     page.catalog = appData.catalog.map(item => {
//         const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
//             onClick: () => events.emit('card:select', item)
//         });
//         return card.render({
//             title: item.title,
//             image: item.image,
//             description: item.about,
//             status: {
//                 status: item.status,
//                 label: item.statusLabel
//             },
//         });
//     });

//     page.counter = appData.getClosedLots().length;
// });

// // Отправлена форма заказа
// events.on('order:submit', () => {
//     api.orderLots(appData.order)
//         .then((result) => {
//             const success = new Success(cloneTemplate(successTemplate), {
//                 onClick: () => {
//                     modal.close();
//                     appData.clearBasket();
//                     events.emit('auction:changed');
//                 }
//             });

//             modal.render({
//                 content: success.render({})
//             });
//         })
//         .catch(err => {
//             console.error(err);
//         });
// });

// // Изменилось состояние валидации формы
// events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
//     const { email, phone } = errors;
//     order.valid = !email && !phone;
//     order.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
// });

// // Изменилось одно из полей
// events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
//     appData.setOrderField(data.field, data.value);
// });


// // Открыть активные лоты
// events.on('bids:open', () => {
//     modal.render({
//         content: createElement<HTMLElement>('div', {}, [
//             tabs.render({
//                 selected: 'active'
//             }),
//             bids.render()
//         ])
//     });
// });

// // Открыть закрытые лоты
// events.on('basket:open', () => {
//     modal.render({
//         content: createElement<HTMLElement>('div', {}, [
//             tabs.render({
//                 selected: 'closed'
//             }),
//             basket.render()
//         ])
//     });
// });

// // Изменения в лоте, но лучше все пересчитать
// events.on('auction:changed', () => {

//     page.counter = appData.getClosedLots().length;

//     bids.items = appData.getActiveLots().map(item => {
//         const card = new BidItem(cloneTemplate(cardBasketTemplate), {
//             onClick: () => events.emit('preview:changed', item)
//         });

//         return card.render({
//             title: item.title,
//             image: item.image,
//             status: {
//                 amount: item.price,
//                 status: item.isMyBid
//             }
//         });
//     });
//     let total = 0;
//     basket.items = appData.getClosedLots().map(item => {
//         const card = new BidItem(cloneTemplate(soldTemplate), {
//             onClick: (event) => {
//                 const checkbox = event.target as HTMLInputElement;
//                 appData.toggleOrderedLot(item.id, checkbox.checked);
//                 basket.total = appData.getTotal();
//                 basket.selected = appData.order.items;
//             }
//         });
//         return card.render({
//             title: item.title,
//             image: item.image,
//             status: {
//                 amount: item.price,
//                 status: item.isMyBid
//             }
//         });
//     });
//     basket.selected = appData.order.items;
//     basket.total = total;
// })



// // Изменен открытый выбранный лот
// events.on('preview:changed', (item: LotItem) => {
//     const showItem = (item: LotItem) => {
//         const card = new AuctionItem(cloneTemplate(cardPreviewTemplate));
//         const auction = new Auction(cloneTemplate(auctionTemplate), {
//             onSubmit: (price) => {
//                 item.placeBid(price);
//                 auction.render({
//                     status: item.status,
//                     time: item.timeStatus,
//                     label: item.auctionStatus,
//                     nextBid: item.nextBid,
//                     history: item.history
//                 });
//             }
//         });

//         modal.render({
//             content: card.render({
//                 title: item.title,
//                 image: item.image,
//                 description: item.description.split("\n"),
//                 status: auction.render({
//                     status: item.status,
//                     time: item.timeStatus,
//                     label: item.auctionStatus,
//                     nextBid: item.nextBid,
//                     history: item.history
//                 })
//             })
//         });

//         if (item.status === 'active') {
//             auction.focus();
//         }
//     };

//     if (item) {
//         api.getLotItem(item.id)
//             .then((result) => {
//                 item.description = result.description;
//                 item.history = result.history;
//                 showItem(item);
//             })
//             .catch((err) => {
//                 console.error(err);
//             })
//     } else {
//         modal.close();
//     }
// });


// // Блокируем прокрутку страницы если открыта модалка
// events.on('modal:open', () => {
//     page.locked = true;
// });

// // ... и разблокируем
// events.on('modal:close', () => {
//     page.locked = false;
// });


