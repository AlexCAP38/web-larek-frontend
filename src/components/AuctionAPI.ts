import { Api, ApiListResponse } from './base/api';
import { IOrderResult, IItem, IOOrder } from "../types";

export interface IAuctionAPI {
    getLotList: () => Promise<IItem[]>;
    orderLots: (order: IOOrder) => Promise<IOrderResult>;
}

export class AuctionAPI extends Api implements IAuctionAPI {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    //гет запрос расширенный от базового, возвращает промис Тип которого массив из ILOT
    getLotList(): Promise<IItem[]> {
        
        //Берем основной запрос у базового класса добавляем в него раздел откуда будем запрашивать
        //инофрмацию
        return this.get('/product')
        
        //Ответ будет типом присваивается тип, какая структура вернется
        .then((data: ApiListResponse<IItem>) => {

            //методом перебираем каждый элемент и создаем новый оъбект
            //изменяя в текущем элементе строчку имадже добавляя туда урл 
            return data.items.map((item) => ({...item, image: this.cdn + item.image}))
        }
            );

    }

    orderLots(order: IOOrder): Promise<IOrderResult> {
        return this.post('/order', order).then(
            (data: IOrderResult) => data
        );
    } 

}