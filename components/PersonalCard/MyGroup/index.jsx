import { Fragment, useState } from 'react';
import { cn } from '@/shared/lib/cn';

import { Text, Title } from '@/shared/ui/typography';
import GroupCard from './GroupCard';
import { StyledDivider } from './GroupCard.styled';

const MyGroup = ({ title, sx, userId, className }) => {
  const [response, setResponse] = useState(null);

  const getTargetIndexById = (data, id) => {
    if (!Array.isArray(data)) return -1;
    const targetIndex = data.findIndex((item) => item?.id === id);
    if (!(targetIndex > -1)) return -1;
    return targetIndex;
  };

  const handleUpdateGrouping = (id) => {
    setResponse((pre) => {
      const targetIndex = getTargetIndexById(pre.data, id);
      if (!(targetIndex > -1)) return pre;
      const target = pre.data[targetIndex];
      const updatedTarget = { ...target, isGrouping: !target.isGrouping };

      return {
        ...pre,
        data: [
          ...pre.data.slice(0, targetIndex),
          updatedTarget,
          ...pre.data.slice(targetIndex + 1),
        ],
      };
    });
  };

  const handleDeleteGroup = (id) => {
    setResponse((pre) => {
      const targetIndex = getTargetIndexById(pre.data, id);
      if (!(targetIndex > -1)) return pre;

      return {
        ...pre,
        data: [
          ...pre.data.slice(0, targetIndex),
          ...pre.data.slice(targetIndex + 1),
        ],
      };
    });
  };

  if (!userId) {
    return <Text className="py-[30px]">趕快發起屬於你的揪團吧～</Text>;
  }

  return (
    <div
      className={cn(
        'bg-white max-w-[672px] rounded-2xl py-9 px-10 flex flex-col justify-center items-center max-md:py-4 max-md:px-5',
        className
      )}
      style={sx}
    >
      {title && (
        <Title
          size="md"
          className="mb-1 text-[22px] font-bold text-[#536166]"
        >
          {title}
        </Title>
      )}

      <div className="w-full">
        {Array.isArray(response?.data) && response.data.length ? (
          response.data.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 && <StyledDivider />}
              <GroupCard
                {...item}
                userId={userId}
                onUpdateGrouping={() => handleUpdateGrouping(item.id)}
                onDeleteGroup={() => handleDeleteGroup(item.id)}
              />
            </Fragment>
          ))
        ) : (
          <Text className="py-[30px]">趕快發起屬於你的揪團吧～</Text>
        )}
      </div>
    </div>
  );
};

export default MyGroup;
