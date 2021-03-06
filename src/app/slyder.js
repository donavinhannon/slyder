export function Slyder(animationType, animationDirection) {
    // const current = document.querySelector('.sly-page');
    // const next = document.querySelector('.sly-page--next');
    let isAnimating = false;
    const animationEndEventName = whichAnimationEvent();
    let outClass = ['sly-moveToLeft'];
    let inClass = ['sly-moveFromRight'];
    setCaseName(0);
    let paths = [];
    let caseName = '';

    async function animation(currentPage, nextPage) {
        const current = document.querySelector(currentPage);
        const next = document.querySelector(nextPage);

        const updateClasses = (current, next) => {
            next.classList.remove('sly-page--next');
            next.classList.add(...inClass, 'sly-page--current');
            current.classList.remove('sly-page--current');
            current.classList.add(...outClass);
        }

        // Functions to handle animationEndEvent

        const handleNextAnimationEnd = () => {
            next.classList.remove(...inClass);
            next.removeEventListener(animationEndEventName, handleNextAnimationEnd);
        }

        const handleCurrentAnimationEnd = () => {
            current.removeEventListener(animationEndEventName, handleCurrentAnimationEnd);
            current.remove();
            isAnimating = false;
        }

        // Functions to add animationend event listeners
        const addNextListener = async (next) => {
            next.addEventListener(animationEndEventName, handleNextAnimationEnd);
        }

        const addCurrentListener = async (current) => {
            current.addEventListener(animationEndEventName, handleCurrentAnimationEnd);
        }

        // Add animation end listeners in parallel, then update animation classes
        await Promise.all([
            await addNextListener(next),
            await addCurrentListener(current)
        ]).then(updateClasses(current, next));
    }

    function addLinkIndexes(container, linkSelector = 'a') {
        if (!container instanceof HTMLElement) return console.error('container argument passed to Slyder.addLinkIndexes must be of type HTMLElement');
        let linkTags = container.querySelectorAll(linkSelector);
        let links = Array.prototype.slice.call(linkTags);

        // function handleClick() {
        //     event.target.dataset[slyIdx]
        // }

        
        for (let i = 0; i < links.length; i++) {
            links[i].dataset.slyIdx = i;
            // links[i].addEventListener('click', handleClick);
            // only add indexes to links within this website
            if (links[i]['hostname'] === window.location.hostname) {
                paths.push(links[i]['pathname']);
            }
        }

    }

    function compareIndexes(nextPath = '') {
        try {
            let currentIdx = paths.findIndex((element) => {
                return element == window.location.hash.slice(2);
            });
            if (currentIdx === -1 || currentIdx == undefined) {currentIdx = 0}

            let nextIdx = paths.findIndex((element) => {
                return element == nextPath;
            });

            if (nextIdx < currentIdx) {
                setCaseName(1);
            } else {
                setCaseName(0);
            }
        }
        catch (error) {console.error(error)}
    }

    function setCaseName(nextIndexHigher = 0) {
        // animationType
        let horizontal = ['ToLeft', 'ToRight'];
        let vertical = ['ToTop', 'ToBottom'];

        if (animationDirection === 'horizontal') {
            caseName = animationType + horizontal[nextIndexHigher];
        }

        if (animationDirection === 'vertical') {
            caseName = animationType + vertical[nextIndexHigher];
        }

        setAnimationClasses(caseName);
    }

    function setAnimationClasses(caseName) {
        switch (caseName) {
            case 'moveToLeft':
                outClass = ['sly-moveToLeft'];
                inClass = ['sly-moveFromRight'];
                break;
            case 'moveToRight':
                outClass = ['sly-moveToRight'];
                inClass = ['sly-moveFromLeft'];
                break;
            case 'moveToTop':
                outClass = ['sly-moveToTop'];
                inClass = ['sly-moveFromBottom'];
                break;
            case 'moveToBottom':
                outClass = ['sly-moveToBottom'];
                inClass = ['sly-moveFromTop'];
                break;
            case 'fadeToLeft':
                outClass = ['sly-fade'];
                inClass = ['sly-fadeFromRight', 'sly-page--ontop'];
                break;
            case 'fadeToRight':
                outClass = ['sly-fade'];
                inClass = ['sly-fadeFromLeft', 'sly-page--ontop'];
                break;
            case 'fadeToTop':
                outClass = ['sly-fade'];
                inClass = ['sly-fadeFromBottom', 'sly-page--ontop'];
                break;
            case 'fadeToBottom':
                outClass = ['sly-fade'];
                inClass = ['sly-fadeFromTop', 'sly-page--ontop'];
                break;
            case 'fadeToLeft':
                outClass = ['sly-fadeToLeft'];
                inClass = ['sly-fadeFromRight'];
                break;
            case 'fadeToRight':
                outClass = ['sly-fadeToRight'];
                inClass = ['sly-fadeFromLeft'];
                break;
            case 'fadeToTop':
                outClass = ['sly-fadeToTop'];
                inClass = ['sly-fadeFromBottom'];
                break;
            case 'fadeToBottom':
                outClass = ['sly-fadeToBottom'];
                inClass = ['sly-fadeFromTop'];
                break;
        }
    }

    // replace the content of the of the element with id arg
    function replaceContent(id) {
        if (isAnimating) {
            return false;
        }
        isAnimating = true;

        try {
            const template = document.getElementById(id);
        } catch (error) {
             console.error(error);
             
        }

        // check for <template> support
        if ('content' in document.createElement('template')) {
            // $content is the element who's content you would like to append to
            const $content = document.getElementById('sly-container');

            // select the template used to replace $content
            const template = document.getElementById(id);

            // clone it, clear the $content, insert your cloned template to $content
            const clone = document.importNode(template.content, true);
            // $content.innerHTML = '';
            $content.appendChild(clone);

            return true;

        } else {
            alert('HTML template tags are not supported by your browser. Please upgrade to the latest version of Firefox or Chrome.')
        }
    }

    // detect the correct transition event
    function whichAnimationEvent() {
        const el = document.createElement("div");

        const animations = {
            "onanimationend": "animationend",
            "onoanimationend": "oanimationend",
            "onmozanimationend": "animationend",
            "onwebkitanimationend": "webkitanimationend"
        }

        const animationKeys = Object.keys(animations);

        // returns the first key that matches an animation property
        // of the HMTLElement for users browser
        function getKey(myKeys) {
            let keys = [];
            myKeys.forEach((key) => {
                if (el[key] !== undefined) {
                    keys.push(animations[key]);
                }
            });
            return keys[0];
        }

        return getKey(animationKeys);

    }

    const _isAnimating = () => isAnimating;
    const _paths = () => paths;

    // Public Api for Slyder instances
    return {
        animate: animation,
        addLinkIndexes,
        replaceContent,
        isAnimating: _isAnimating,
        paths: _paths,
        compareIndexes
    }
};