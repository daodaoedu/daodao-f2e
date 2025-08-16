import { Fragment, useState } from 'react';
import { cn } from '@/utils/cn';
import { Text, Title } from '@/components/ui/typography';
import useFetch from '@/hooks/useFetch';
import GroupCard from './GroupCard';
import LoadingCard from './LoadingCard';
import { StyledDivider } from './GroupCard.styled';

const MyResource = ({ title, sx, userId, className }) => {
  const [response, setResponse] = useState(null);
  const { isFetching } = useFetch(`/circles/user/${userId}`, {
    enabled: !!userId,
    onSuccess: setResponse,
  });

  const getTargetIndexById = (data, id) => {
    if (!Array.isArray(data)) return -1;
    const targetIndex = data.findIndex((item) => item?._id === id);
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
    return <Text className="py-[30px]">開發中敬請期待～</Text>;
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
        {isFetching ? (
          <LoadingCard />
        ) : Array.isArray(response?.data) && response.data.length ? (
          response.data.map((item, index) => (
            <Fragment key={item._id}>
              {index > 0 && <StyledDivider />}
              <GroupCard
                {...item}
                userId={userId}
                onUpdateGrouping={() => handleUpdateGrouping(item._id)}
                onDeleteGroup={() => handleDeleteGroup(item._id)}
              />
            </Fragment>
          ))
        ) : (
          <Text className="py-[30px]">開發中敬請期待～</Text>
        )}
      </div>
    </div>
  );
};

export default MyResource;
