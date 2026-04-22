const TimelineRuler: React.FC = () => {
    return (
        <div className='sticky top-0 z-1'>
            <div
                className='pointer-events-none absolute top-0 h-7 bg-gray-300'
                style={{ width: "1949px" }}></div>

            <div
                id='tick-headers'
                className='flex overflow-hidden select-none h-7 pl-4'
                style={{ width: "1949px" }}>
                {Array.from<number>({ length: 10 }).map((index: number) => {
                    return (
                        <div key={index} className='relative flex-1'>
                            <div
                                className='bg-editor-starter-panel flex items-start truncate border-l border-l-gray-500 pt-3 pl-1 text-slate-800 h-7'
                                style={{
                                    fontSize: "10px",
                                }}>
                                00:30
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TimelineRuler;
