import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

sidebar_pattern = r"(<Sidebar \n          results=\{inbox\?\.results \|\| \[\]\} \n          selectedTicker=\{selectedTicker\}\n          onSelect=\{setSelectedTicker\}\n          onManage=\{.*\}\n        />)"
content = re.sub(sidebar_pattern, r"{currentView === 'watchlist' && \1}", content)

header_pattern = r"(<header className=.*?<div className=.flex items-center gap-2 md:hidden..>.*?Context</span>\n              </div>)"

new_header = r"""<header className="px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-slate-100 flex items-center justify-center font-bold text-white dark:text-slate-900 text-xs">
                  C
                </div>
                <span className="font-bold text-gray-900 dark:text-slate-100 hidden md:block">Context</span>
              </div>
              <nav className="flex items-center gap-1">
                <button onClick={() => setCurrentView('stocks')} className={currentView === 'stocks' ? "px-3 py-1.5 font-semibold text-gray-900 dark:text-slate-100 bg-gray-100 dark:bg-slate-800 rounded-lg" : "px-3 py-1.5 font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"}>Stocks</button>
                <button onClick={() => setCurrentView('watchlist')} className={currentView === 'watchlist' ? "px-3 py-1.5 font-semibold text-gray-900 dark:text-slate-100 bg-gray-100 dark:bg-slate-800 rounded-lg" : "px-3 py-1.5 font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors"}>My Watchlist</button>
              </nav>
            </div>"""
content = re.sub(header_pattern, new_header, content, flags=re.DOTALL)

main_content_pattern = r'(<div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-10 space-y-12">.*?)(\s*</main>)'

def replacer(match):
    original_main = match.group(1)
    return """
            {currentView === 'stocks' ? (
              <StocksView />
            ) : (
              """ + original_main + """
            )}""" + match.group(2)

content = re.sub(main_content_pattern, replacer, content, flags=re.DOTALL)

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
