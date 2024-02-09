import {IEvents} from "./events";

/**
 * Базовый компонент
 */
export abstract class Component<T> {
    
    protected constructor(protected readonly container: HTMLElement) {
        // Учитывайте что код в конструкторе исполняется ДО всех объявлений в дочернем классе
    }

    // Инструментарий для работы с DOM в дочерних компонентах

    // Переключить класс
    toggleClass(element: HTMLElement, className: string, force?: boolean) {
        element.classList.toggle(className, force);
    }

    addClass(element: HTMLElement, className: string) {
        element.classList.add(className);
    }

    removeClass(element: HTMLElement, className: string) {
        element.classList.remove(className);
    }


    // Установить текстовое содержимое
    protected setText(element: HTMLElement, value: unknown) {
        if (element) {
            element.textContent = String(value);
        }
    }

    // Сменить статус блокировки
    setDisabled(element: HTMLElement, state: boolean) {
        if (element) {
            if (state) element.setAttribute('disabled', 'disabled');
            else element.removeAttribute('disabled');
        }
    }

    // Скрыть
    protected setHidden(element: HTMLElement) {
        element.style.display = 'none';
    }

    // Показать
    protected setVisible(element: HTMLElement) {
        element.style.removeProperty('display');
    }

    // Установить изображение с алтернативным текстом
    protected setImage(element: HTMLImageElement, src: string, alt?: string) {
        if (element) {
            element.src = src;
            if (alt) {
                element.alt = alt;
            }
        }
    }

    // Вернуть корневой DOM-элемент
    // Принимает данные с необязательными свойстваим
    //  возвращает HTMLElement
    render(data?: Partial<T>): HTMLElement {
        
        // Купирует из data в this - считается как object
        //если data определена то копирует иначе копируем пустой объект
        Object.assign(this as object, data ?? {});
        
        return this.container;
    }
}
