import { useEffect } from 'react';

/**
 * Custom hook to set the document title with the app name.
 * 
 * @param {string} pageTitle - The page-specific title.
 * @param {boolean} includeAppName - Whether to include the app name. Defaults to true.
 * @param {string} appName - The name of the application. Defaults to 'Popcorn not included'.
 */
const useDocumentTitle = (
  pageTitle, 
  includeAppName = true, 
  appName = 'Popcorn not included'
) => {
  useEffect(() => {
    // If page title is provided and we should include app name
    if (pageTitle && includeAppName) {
      document.title = `${pageTitle} | ${appName}`;
    } 
    // If page title is provided but we shouldn't include app name
    else if (pageTitle) {
      document.title = pageTitle;
    } 
    // If no page title, just use app name
    else {
      document.title = appName;
    }

    // Reset title when component unmounts
    return () => {
      document.title = appName;
    };
  }, [pageTitle, includeAppName, appName]);
};

export default useDocumentTitle;
