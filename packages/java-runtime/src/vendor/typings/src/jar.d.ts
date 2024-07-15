/**
 * Given a folder that contains the contents of a JAR file, parses the MANIFEST
 * file and other metadata and makes it available to Doppio in a convenient
 * format.
 *
 * @see http://docs.oracle.com/javase/7/docs/technotes/guides/jar/jar.html#Notes_on_Manifest_and_Signature_Files
 * @todo Add a function for producing a Java object from this.
 */
export default class JAR {
    private attributes;
    private classpath;
    /**
     * Calls doneCb when it is finished opening and parsing the MANIFEST file.
     */
    constructor(dir: string, doneCb: (err?: Error) => void);
    /**
     * Sets the given attribute from parsed information. This function decides if
     * we digest the information further, or toss it.
     */
    private _setAttribute(attribute, value);
    /**
     * Return the items in this JAR file's classpath.
     */
    getClassPath(): string[];
    /**
     * Returns NULL if the attribute does not exist.
     * Attribute names are case insensitive
     */
    getAttribute(attribute: string): string;
    /**
     * Primarily used for debugging.
     */
    toString(): string;
}
