export class SortableList {
    constructor({
        wrapper,
        itemSelector,
        headerSelector,
        defaultSort = null,
        ascending = true,
        sorters = {}
    }) {
        this.wrapper = typeof wrapper === "string" ? document.querySelector(wrapper) : wrapper;
        this.itemSelector = itemSelector;
        this.sorters = sorters;
        this.state = {
            column: defaultSort,
            ascending
        };
        this.headers = document.querySelectorAll(headerSelector);
        this.labels = {};

        this.headers.forEach(header => {
            this.labels[header.dataset.sort] = header.querySelector("span") ? header.querySelector("span").textContent : header.textContent.trim();
            header.addEventListener("click", () => {
                this.sortBy(header.dataset.sort);
            });
        });

        this.updateHeaders();

        if (defaultSort) {
            this.sort();
        }
    }

    sortBy(column) {
        if (this.state.column === column) {
            this.state.ascending = !this.state.ascending;
        } else {
            this.state.column = column;
            this.state.ascending = true;
        }

        this.updateHeaders();
        this.sort();
    }

    updateHeaders() {
        this.headers.forEach(header => {
            header.classList.remove("sort-asc", "sort-desc");
            if (header.dataset.sort === this.state.column) {
                header.classList.add(this.state.ascending? "sort-asc" : "sort-desc");
            }
        });
    }

    sort() {
        const getter = this.sorters[this.state.column];
        if (!getter) return;

        const elements = [...this.wrapper.querySelectorAll(this.itemSelector)];

        elements.sort((a, b) => {
            const valueA = getter(a);
            const valueB = getter(b);

            let result;

            if (typeof valueA === "string") {
                result = this.state.ascending
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            } else {
                result = this.state.ascending
                    ? valueA - valueB
                    : valueB - valueA;
            }
            
            if (result === 0) {
                return Number(a.dataset.index) - Number(b.dataset.index);
            }

            return result;
        });

        elements.forEach(el => this.wrapper.appendChild(el));
    }
}