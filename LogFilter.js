// LogFilter by User:Hex on the English Wikipedia.
// https://en.wikipedia.org/wiki/User:Hex/Scripts/LogFilter
// Version 1

(function() {

	if (!document.URL.match(
		new RegExp('(?:Special(?::|%3A)(?:(?:Deleted)?Contributions|Log|WhatLinksHere)|action=history)'))
	) return

	const style = document.createElement('style')
	document.head.appendChild(style)

	style.sheet.insertRule(`
	#filterContainer {
		width: fit-content;
		padding-inline: 1em;
		padding-block: 0.5em;
		margin-block: 0.5em;
		border-radius: 0.25em;
		outline-width: 2px;
		outline-style: solid;
		outline-color: #0c69;
		background-color: #cfb;

		&.excludeToggled {
			outline-color: #f009;
			background-color: #faa;
		}

		label::selection {
			background-color: transparent;
		}

		input[type="checkbox"] {
			margin-inline: 0.5em;
		}
	}`)

	function filterItems (filterString) {
		document.querySelectorAll(listSelector).forEach(list => {
			list.querySelectorAll('li').forEach(li => {
				if (!filterString) {
					li.removeAttribute('hidden')
					return
				}

				let matchSource = li.classList.contains('mw-logline-massmessage')
					? 'innerText'
					: 'href'

				const matchAgainst = li.querySelector(linkSelector)[matchSource]
				const excludeToggle = document.querySelector('#excludeToggle')

				const filterRegExp = new RegExp(filterString, 'i')

				if (excludeToggle.checked) {
					if (!matchAgainst.match(filterRegExp))
						li.removeAttribute('hidden')
					else
						li.setAttribute('hidden', true)
				} else {
					if (!matchAgainst.match(filterRegExp))
						li.setAttribute('hidden', true)
					else
						li.removeAttribute('hidden')
				}
			})
		})
	}

	function createLabel (text, forName) {
		const label = document.createElement('label')
		label.innerText = text
		label.setAttribute('for', forName)
		return label
	}

	function createInput (type, id, size) {
		const input = document.createElement('input')
		input.setAttribute('type', type)
		input.setAttribute('id', id)
		size && input.setAttribute('size', size)
		return input
	}

	let logType

	if (document.URL.match('Special(?::|%3A)(?:Deleted)?Contributions')) logType = 'contribs'
	if (document.URL.match('action=history'))                            logType = 'history'
	if (document.URL.match('Special(?::|%3A)Log'))                       logType = 'log'
	if (document.URL.match('Special(?::|%3A)WhatLinksHere'))             logType = 'links'

	const filterContainer = document.createElement('div')
	filterContainer.setAttribute('id', 'filterContainer')

	filterContainer.appendChild(createLabel(`Filter ${ logType === 'history' ? 'users' : 'titles' }: `, 'filterInput'))
	filterContainer.appendChild(createInput('text', 'filterInput', 30))
	filterContainer.appendChild(createInput('checkbox', 'excludeToggle'))
	filterContainer.appendChild(createLabel('Exclude', 'excludeToggle'))

	let parentNode = document.querySelector('#mw-content-text')

	let listSelector, linkSelector, insertBeforeNode

	switch (logType) {
		case 'contribs':
			listSelector = '.mw-contributions-list'
			linkSelector = '.mw-contributions-title'
			insertBeforeNode = parentNode.querySelector('.mw-pager-body')
			break
		case 'history':
			listSelector = '.mw-contributions-list'
			linkSelector = '.mw-userlink'
			parentNode = document.querySelector('#mw-history-compare')
			insertBeforeNode = parentNode.querySelector('.mw-pager-body')
			break
		case 'log':
			listSelector = '.mw-logevent-loglines'
			linkSelector = '& > a:nth-of-type(3)'
			insertBeforeNode = document.querySelector('#mw-log-deleterevision-submit')
				?? document.querySelector(listSelector)
			break
		case 'links':
			listSelector = '#mw-whatlinkshere-list'
			linkSelector = 'a'
			insertBeforeNode = document.querySelector(listSelector)
	}

	parentNode.insertBefore(filterContainer, insertBeforeNode)

	filterInput.addEventListener('keyup', () => filterItems(filterInput.value))
	excludeToggle.addEventListener('change', () => {
		filterContainer.classList.toggle('excludeToggled')
		filterItems(filterInput.value)
	})

})()
