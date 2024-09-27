import { Stack, Skeleton } from '@mui/material';

const PartnerSkelton = () => {
  const array = new Uint32Array(1);
  return (
    <Stack
      padding="12px"
      sx={{ padding: '12px', minHeight: '192px', bgcolor: '#fff' }}
    >
      <Stack direction="row" alignItems="center" gap="12px" mb="8px">
        <Skeleton variant="circular" width={50} height={50} />
        <Skeleton
          variant="rounded"
          width={122}
          height={26}
          sx={{ borderRadius: '4px' }}
        />
      </Stack>
      <Stack sx={{ marginBottom: '26px' }}>
        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
      </Stack>
      <Stack direction="row">
        {new Array(3).fill(0).map((_, idx) => (
          <Skeleton
            variant="rounded"
            width={60}
            height={23}
            key={`partnerSkelton-${Math.floor(
              crypto.getRandomValues(array)[0],
            )}`}
            sx={{ mr: '8px', borderRadius: '18px' }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default PartnerSkelton;
