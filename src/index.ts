import './scss/styles.scss';

//********импорт библиотек */
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';
import { Page } from "./components/Page";
import { cloneTemplate, createElement, ensureElement } from "./utils/utils";
import { Card, BasketItem } from './components/Card';
import { AppState, CatalogChangeEvent, LotItem } from "./components/AppData";
// import { Auction, AuctionItem, BidItem } from "./components/Card";
import { AuctionAPI } from './components/AuctionAPI';
import { Modal } from "./components/common/Modal";
import { Basket } from "./components/common/Basket";

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');        //темплейт карточки для главной страницы
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');     //темплейт ПРЕВЬЮ
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');       //темплейт  КОРЗИНА
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');      //темплейт
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');     //темплейт
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');     //темплейт
const successTemplate = ensureElement<HTMLTemplateElement>('#success');     //ордер

//инициалиазция экземпляров
const events = new EventEmitter();        //Экземпляр работающий с событиями

//передаем основной урл + где будет храниться контент
const api = new AuctionAPI('https://larek-api.nomoreparties.co/content/weblarek', 'https://larek-api.nomoreparties.co/api/weblarek');

const appData = new AppState({}, events);      //Экземпляр хранить в себе информацию карточек
const page = new Page(document.body, events);      //Экземпляр для работы с основным окном
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events, page);      //Экземпляр для работы с модалным окном
const basket = new Basket(cloneTemplate(basketTemplate), events);      //Экземпляр хранить в себе информацию КОРЗИНЫ

//*******************************************ЛОГИКА***************************

// ПОЛУЧЕНИЕ ДАННЫХ с сервера и записываем из в экземпляр appData
api.getLotList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });

// ДОБАВЛЕНГИЕ карточек на основной экран
events.on('items:changed', () => {

    //Page это экземляр хранящий в себе места куда что-то надо вставлять
    page.catalog = appData.catalog.map(item => {        //берем карточку из appData.catalog 

        //создаем новый экземпляр карточки, клонируем шаблон, добавляем действие этому шаблону
        const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)     //Событие мработает когда кликнем по карточке 
        });

        // закидываем объект с данными из итема
        // функция установит значения в экзепляр через сетеры
        return card.render({
            title: item.title,
            image: item.image,
            description: item.about,
            category: item.category,
            price: item.price
        });
    });

});

// Событие при клике на карточку на главном экране
events.on('card:select', (item: LotItem) => {
    appData.setPreview(item);       //открываем превью, передаем туда карточку
});


// ОТКРЫТЬ МОДАЛЬНОЕ ОКНО ПРЕВЬЮ, событие срабатывает при клик по карточке на основной странице.
// Параметр карточка по которой кликнули
events.on('preview:changed', (item: LotItem) => {

    page.locked = true;    //Блокируем прокрутку основного экрана

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


// НАЖАЛИ ДОБАВИТЬ В КОРЗИНУ. Событие клик по кнопке добавления товара в корзину в модалке
// передаем аргумент item текущую карточку
events.on('basket:click', ((item: LotItem) => {

    //!!!!!!!!!!!!!!!!!!! ЭТИМ ДЕЙСТИЕМ НАДО добавлять товар в корзину баскета
    //ТУТ ЛОГИКА

    //Создаем HTML карточку из шаблона для "карточка для корзины
    //событие пока не устанавливаю

    const basketItem = new BasketItem('card', cloneTemplate(cardBasketTemplate), { onClick: () => { console.log('нажата кнопка удаления') } })

    basket.items = [basketItem.render({
            title: item.title,
            price: item.price
        })]


    
    modal.close();
}))


//НАЖАЛИ НА КОРЗИНУ, Событие по клику на корзину
events.on('basket:open', (() => {


basket.render();

    //Тут надо рендерить модальку и запихивать туда корзину
    // modal.render ({})
    console.log('Нажалась корзина')
}))



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

// // Открыть форму заказа
// events.on('order:open', () => {
//     modal.render({
//         content: order.render({
//             phone: '',
//             email: '',
//             valid: false,
//             errors: []
//         })
//     });
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


