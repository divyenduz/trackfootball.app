import React from 'react'

import { GetServerSidePropsContext } from 'next'

export default function OverviewPage({}) {
  return <></>
}

export async function getServerSideProps({
  req,
  res,
  params,
}: GetServerSidePropsContext) {
  const id = parseInt(params?.id as string)

  return {
    redirect: {
      destination: `/athlete/${id}`,
      permanent: false,
    },
  }
}
