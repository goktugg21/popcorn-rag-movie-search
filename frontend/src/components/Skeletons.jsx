import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 animate-pulse">
      <div className="h-48 bg-gray-300 dark:bg-gray-600"></div>
      <div className="p-4">
        <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-600 mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 w-5/6"></div>
        </div>
        <div className="mt-4 h-8 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

export const MovieCardSkeleton = () => {
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 animate-pulse">
      <div className="aspect-[2/3] bg-gray-300 dark:bg-gray-600"></div>
      <div className="p-3">
        <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-600 mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 mb-2"></div>
        <div className="flex gap-1 mb-2">
          <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-4 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="h-6 w-full bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  );
};

export const DetailSkeleton = () => {
  return (
    <div className="container mx-auto p-4 animate-pulse">
      <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 mb-6 rounded"></div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 aspect-[2/3] bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        <div className="w-full md:w-2/3 space-y-4">
          <div className="h-8 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="flex gap-2 flex-wrap">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 w-16 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 w-3/4"></div>
          </div>
          <div className="py-4">
            <div className="h-8 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SearchResultsSkeleton = () => {
  return (
    <div className="container mx-auto p-4 animate-pulse">
      <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 mb-6 rounded"></div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="w-full md:w-3/4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
          <div className="mt-8 h-10 flex justify-center">
            <div className="h-full w-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HomeSkeleton = () => {
  return (
    <div className="container mx-auto p-4 animate-pulse">
      <div className="h-96 w-full bg-gray-300 dark:bg-gray-700 rounded-lg mb-8"></div>
      <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
      <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mt-8 mb-4"></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const NotFoundSkeleton = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-pulse">
      <div className="text-center p-8">
        <div className="h-24 w-24 mx-auto bg-gray-300 dark:bg-gray-700 rounded-full mb-6"></div>
        <div className="h-10 w-48 mx-auto bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-6 w-64 mx-auto bg-gray-200 dark:bg-gray-600 rounded mb-6"></div>
        <div className="h-10 w-32 mx-auto bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};
