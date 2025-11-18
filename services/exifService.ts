import { ExifData } from '../types';

// ExifReader is loaded from a script tag in index.html
declare const ExifReader: any;

/**
 * Extracts EXIF data from an image file.
 * @param file The image file to process.
 * @returns A promise that resolves to an object of EXIF data or null if none is found.
 */
export const extractExifData = async (file: File): Promise<ExifData | null> => {
    // Basic check for image types that commonly contain EXIF data
    if (!file.type.match(/image\/(jpeg|jpg|tiff|heic|heif)/)) {
        return null;
    }

    try {
        const tags = await ExifReader.load(file);
        
        // Return null if no tags are found
        if (!tags || Object.keys(tags).length === 0) {
            return null;
        }

        const relevantTags: ExifData = {};
        
        // Remove the thumbnail data to keep the object clean and small
        if (tags['Thumbnail']) {
            delete tags['Thumbnail'];
        }

        for (const tagName in tags) {
            if (tags.hasOwnProperty(tagName)) {
                // The description is a more human-readable version of the value
                if(tags[tagName].description) {
                    relevantTags[tagName] = tags[tagName].description;
                }
            }
        }

        return Object.keys(relevantTags).length > 0 ? relevantTags : null;

    } catch (error) {
        // This can happen if the file is not a valid image or is corrupted
        console.error("Error reading EXIF data:", error);
        return null;
    }
};
