export type LotStatus = 'wait' | 'active' | 'closed';

export interface IAuction {
    status: LotStatus;
    datetime: string;
    price: number;
    minPrice: number;
    history?: number[];
}

//Структура моей карточки
export interface IItem {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number
}

export type ILot = IItem & IAuction;

export type LotUpdate = Pick<ILot, 'id' | 'datetime' | 'status' | 'price' | 'history'>;

export type IBasketItem = Pick<ILot, 'id' | 'title' | 'price'> & {
    isMyBid: boolean
};

export interface IAppState {
    catalog: ILot[];
    basket: string[];
    preview: string | null;
    order: IOrder | null;
    loading: boolean;
}

export interface IOrderForm {
    email: string;
    phone: string;
}

export interface IOrder extends IOrderForm {
    items: string[]
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IBid {
    price: number
}

export interface IOrderResult {
    id: string;
}