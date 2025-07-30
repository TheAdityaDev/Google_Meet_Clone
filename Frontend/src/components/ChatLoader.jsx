
const ChatLoader = () => {
  return (
    <div className="min-h-52 overflow-hidden px-8 py-5">
      <div className="relative  flex items-center space-x-2 ">
        <div className="float-left flex justify-start items-center gap-4">
          <div className="animate-pulse rounded-full bg-gray-500 h-12 w-12" />
          <div className="space-y-2">
            <div className="animate-pulse rounded-md bg-gray-500 h-10 w-[300px]">
              {" "}
            </div>
            <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[100px]">
              {" "}
            </div>
          </div>
        </div>
        <div className="fixed top-40 right-0 flex  items-center gap-4 px-8 py-5">
          <div className="space-y-2">
            <div className="animate-pulse rounded-md bg-gray-500 h-10 w-[300px]">
              {" "}
            </div>
            <div className="animate-pulse absolute right-24 rounded-md bg-gray-500 h-4 w-[100px] ">
              {" "}
            </div>
          </div>
          <div className="animate-pulse rounded-full bg-gray-500 h-12 w-12" />
        </div>
      </div>
      <div className="top-[40%] absolute">
        <div className="float-left flex justify-start items-center gap-4">
          <div className="animate-pulse rounded-full bg-gray-500 h-12 w-12" />
          <div className="space-y-2">
            <div className="animate-pulse rounded-md bg-gray-500 h-10 w-[300px]">
              {" "}
            </div>
            <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[100px]">
              {" "}
            </div>
          </div>
        </div>
      </div>
      <div className="right-0 top-[56%] absolute px-8 py-5">
        <div className="float-right flex items-center gap-4">
         <div className="space-y-2">
            <div className="animate-pulse rounded-md bg-gray-500 h-10 w-[300px]">
              {" "}
            </div>
            <div className="animate-pulse absolute right-24 rounded-md bg-gray-500 h-4 w-[100px] ">
              {" "}
            </div>
          </div>
          <div className="animate-pulse rounded-full bg-gray-500 h-12 w-12" />
        </div>
      </div>
      <div className="top-[75%] absolute">
       <div className="float-left flex justify-start items-center gap-4">
          <div className="animate-pulse rounded-full bg-gray-500 h-12 w-12" />
          <div className="space-y-2">
            <div className="animate-pulse rounded-md bg-gray-500 h-10 w-[300px]">
              {" "}
            </div>
            <div className="animate-pulse rounded-md bg-gray-500 h-4 w-[100px]">
              {" "}
            </div>
          </div>
          </div>
      </div>
    </div>
  );
};

export default ChatLoader;
